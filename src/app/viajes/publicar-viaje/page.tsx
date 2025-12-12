"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { getAuth } from "firebase/auth";
import MapboxMap from "../../../components/MapboxMap";

// Coordenadas por defecto (Santiago Centro)
const DEFAULT_LAT = -33.4489;
const DEFAULT_LNG = -70.6693;

type Suggestion = {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
};

export default function PublicarViajePage() {
  const router = useRouter();
  
  // Form states
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState("");
  
  // Map & Geocoding states
  const [mapCoords, setMapCoords] = useState({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  
  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string, field: "from" | "to") => {
    if (field === "from") setFrom(query);
    else setTo(query);
    setActiveField(field);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!token) return;

        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${token}&country=cl&limit=5`
        );
        const data = await res.json();
        if (data.features) {
          setSuggestions(data.features);
        }
      } catch (e) {
        console.error("Error fetching geocoding:", e);
      }
    }, 300);
  };

  const selectSuggestion = (s: Suggestion) => {
    const coords = { lat: s.center[1], lng: s.center[0] };
    
    if (activeField === "from") {
      setFrom(s.place_name);
      setOriginCoords(coords);
    } else if (activeField === "to") {
      setTo(s.place_name);
      setDestinationCoords(coords);
    }
    
    // Centrar el mapa en la nueva selección
    setMapCoords(coords);
    setSuggestions([]);
    setActiveField(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!from) return setError("Ingresa el origen");
    if (!to) return setError("Ingresa el destino");
    if (!time) return setError("Ingresa la hora de salida");
    if (seats < 1 || seats > 6) return setError("El cupo debe ser entre 1 y 6");

    setLoading(true);
    try {
      const user = getAuth().currentUser;
      const token = await user?.getIdToken();
      const res = await fetch("/api/viajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          from,
          to,
          time,
          seats,
          notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al publicar el viaje");
      }
      router.push("/viajes");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error al publicar el viaje");
      } else {
        setError("Error al publicar el viaje");
      }
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center justify-between">
            🚗 Publicar Viaje
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-semibold mb-4 text-duoc-blue">Datos del viaje</h2>
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                
                {/* Origen con Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Origen</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={from}
                    onChange={(e) => handleSearch(e.target.value, "from")}
                    onFocus={() => setActiveField("from")}
                    placeholder="Comuna o dirección"
                    required
                    autoComplete="off"
                  />
                  {activeField === "from" && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                      {suggestions.map((s) => (
                        <li
                          key={s.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => selectSuggestion(s)}
                        >
                          {s.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Destino con Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Destino</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={to}
                    onChange={(e) => handleSearch(e.target.value, "to")}
                    onFocus={() => setActiveField("to")}
                    placeholder="Sede o dirección"
                    required
                    autoComplete="off"
                  />
                  {activeField === "to" && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                      {suggestions.map((s) => (
                        <li
                          key={s.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => selectSuggestion(s)}
                        >
                          {s.place_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-duoc-blue">Hora de salida</label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-duoc-blue">Cupos disponibles</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Notas (opcional)</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Punto de encuentro, aporte combustible, etc."
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-duoc-blue text-white rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition disabled:opacity-50"
                  >
                    {loading ? "Publicando..." : "Publicar Viaje"}
                  </button>
                </div>
              </form>
            </div>

            {/* Mapa */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-[400px] lg:h-auto min-h-[400px] relative">
               <MapboxMap 
                 latitude={mapCoords.lat} 
                 longitude={mapCoords.lng}
                 origin={originCoords}
                 destination={destinationCoords}
               />
               <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-3 rounded-lg text-xs text-gray-600 shadow-sm pointer-events-none">
                 <p>
                   {originCoords && destinationCoords 
                     ? "Ruta visualizada entre origen y destino." 
                     : "Selecciona origen y destino para ver la ruta."}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
