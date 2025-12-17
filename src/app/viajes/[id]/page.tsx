"use client";

import { useEffect, useState, use } from "react";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import MapboxMap from "@/components/MapboxMap";
import { useRouter } from "next/navigation";

type Trip = {
  id: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  notes?: string;
  autor?: { uid: string; nombre: string };
};

export default function ViajeDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [coords, setCoords] = useState<{
    origin: { lat: number; lng: number } | null;
    destination: { lat: number; lng: number } | null;
  }>({ origin: null, destination: null });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Obtener datos del viaje
        const res = await fetch(`/api/viajes/${id}`);
        if (!res.ok) throw new Error("Viaje no encontrado");
        const data = await res.json();
        setTrip(data);

        // 2. Geocodificar direcciones usando Mapbox API
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (token) {
          const fetchCoord = async (query: string) => {
            try {
              const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1&country=CL`;
              const geoRes = await fetch(url);
              const geoData = await geoRes.json();
              if (geoData.features && geoData.features.length > 0) {
                const [lng, lat] = geoData.features[0].center;
                return { lat, lng };
              }
            } catch (e) {
              console.error("Error geocoding:", e);
            }
            return null;
          };

          const [originPos, destPos] = await Promise.all([
            fetchCoord(data.from),
            fetchCoord(data.to)
          ]);

          setCoords({ origin: originPos, destination: destPos });
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  if (loading) return <div className="min-h-screen pt-25 flex justify-center"><p>Cargando...</p></div>;
  if (!trip) return <div className="min-h-screen pt-25 flex justify-center"><p>Viaje no encontrado</p></div>;

  // Centro del mapa: Usar origen si existe, sino Valparaíso por defecto
  const mapCenterLat = coords.origin?.lat || -33.0472;
  const mapCenterLng = coords.origin?.lng || -71.6127;

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8 relative">
            <Link 
              href="/viajes" 
              className="absolute top-6 left-6 p-2 bg-duoc-blue text-white hover:bg-duoc-yellow hover:text-duoc-blue rounded-full transition-colors shadow-md"
              title="Volver a viajes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            
            <h1 className="text-3xl font-bold text-duoc-blue mb-8 border-b pb-4 mt-8 pl-10">
              Detalle del Viaje
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Origen</p>
                  <p className="text-xl text-duoc-blue font-semibold">{trip.from}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Destino</p>
                  <p className="text-xl text-duoc-blue font-semibold">{trip.to}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Horario</p>
                        <p className="text-xl text-duoc-blue font-semibold">{trip.time}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Cupos</p>
                        <p className="text-xl text-duoc-blue font-semibold">{trip.seats} asientos</p>
                    </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Conductor</p>
                  <p className="text-xl text-duoc-blue font-semibold">{trip.autor?.nombre || "Anónimo"}</p>
                </div>
                {trip.notes && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-2">Notas del conductor</p>
                    <p className="text-gray-700 italic text-lg">"{trip.notes}"</p>
                  </div>
                )}

                <div className="pt-6 flex justify-start">
                   <button 
                    onClick={() => alert("Solicitud enviada al conductor")}
                    className="w-full sm:w-auto bg-duoc-yellow text-duoc-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-duoc-blue hover:text-white transition shadow-md transform hover:-translate-y-0.5"
                   >
                     Solicitar Unirse al Viaje
                   </button>
                </div>
              </div>

              {/* Mapa Visualización */}
              <div className="flex flex-col h-full min-h-[400px]">
                 <p className="text-sm text-gray-500 font-medium mb-2">Ruta estimada</p>
                 <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative h-[400px] lg:h-auto">
                    <MapboxMap 
                        latitude={mapCenterLat} 
                        longitude={mapCenterLng} 
                        zoom={11}
                        origin={coords.origin}
                        destination={coords.destination}
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
