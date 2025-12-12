"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import BackButton from "@/components/BackButton";

type Trip = {
  id: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  notes?: string;
  autor?: { uid: string; nombre: string };
};

export default function ViajesPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true);
      try {
        const res = await fetch("/api/viajes");
        if (!res.ok) throw new Error("Error al cargar los viajes");
        const items: Trip[] = await res.json();
        setTrips(items);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  function handleUnirse(trip: Trip) {
    // Aquí se podría implementar la lógica real de unirse (backend)
    // Por ahora solo mostramos el modal de éxito
    setModal({ open: true, message: "¡Te has unido exitosamente al viaje!" });
  }

  function closeModal() {
    setModal({ open: false, message: "" });
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            🚗 Viajes disponibles
          </h1>
          <p className="text-duoc-blue/80 mb-6">
            Encuentra un viaje compartido o publica el tuyo.
          </p>

          <div className="flex justify-start mb-6">
            <Link
              href="/viajes/publicar-viaje"
              className="px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:!text-white transition cursor-pointer"
            >
              Publicar nuevo viaje
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-lg text-gray-500">Cargando viajes...</div>
          ) : trips.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-duoc-blue text-lg">
                No hay viajes publicados aún.<br />
                ¡Sé el primero en publicar uno! 🚀
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trips.map((t) => (
                <article key={t.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-duoc-blue mb-2">{t.from} → {t.to}</h3>
                    <div className="space-y-1 text-sm">
                      <p>Salida: <span className="font-medium">{t.time}</span></p>
                      <p>Cupos: <span className="font-medium">{t.seats}</span></p>
                      <p>Conductor: <span className="font-medium">{t.autor?.nombre || "Anónimo"}</span></p>
                      {t.notes && <p className="mt-2 text-duoc-blue/80 italic">"{t.notes}"</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUnirse(t)}
                    className="mt-4 w-full bg-duoc-yellow text-duoc-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Unirme
                  </button>
                </article>
              ))}
            </div>
          )}
          
          <div className="mt-8">
             <BackButton href="/home"/>
          </div>
        </div>

        {/* Modal simple */}
        {modal.open && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h3 className="text-xl font-bold mb-4 text-duoc-blue">Información</h3>
              <p className="mb-6 text-gray-700">{modal.message}</p>
              <button
                onClick={closeModal}
                className="bg-duoc-blue text-white px-4 py-2 rounded hover:bg-duoc-yellow hover:text-duoc-blue transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
