"use client";

import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import Link from "next/link";

type Ayudantia = {
  id: string;
  materia: string;
  cupo: number;
  inscritos: number;
  horario: string;
  dia: string;
  lugar: string;
  autor: { uid: string; nombre: string };
};


export default function AyudantiasPage() {
  const [ayudantias, setAyudantias] = useState<Ayudantia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  useEffect(() => {
    async function fetchAyudantias() {
      setLoading(true);
      try {
        const res = await fetch("/api/ayudantias");
        if (!res.ok) throw new Error("Error al cargar las ayudantías");
        const items: Ayudantia[] = await res.json();
        setAyudantias(items);
      } finally {
        setLoading(false);
      }
    }
    fetchAyudantias();
  }, []);

  function handleUnirse(ayudantia: Ayudantia) {
    if (ayudantia.inscritos >= ayudantia.cupo) {
      setModal({ open: true, message: "Ayudantía sin cupos disponibles. No es posible unirse." });
    } else {
      setModal({ open: true, message: "¡Te has unido exitosamente a la ayudantía!" });
    }
  }

  function closeModal() {
    setModal({ open: false, message: "" });
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            🤝 Ayudantías disponibles
          </h1>
          <div className="flex justify-start mb-4">
            <Link
              href="/ayudantias/publicar-ayudantia"
              className="px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:!text-white transition cursor-pointer mb-4"
            >
              Publicar nueva ayudantía
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-lg text-gray-500">Cargando ayudantías...</div>
          ) : ayudantias.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-duoc-blue text-lg">
                No hay ayudantías publicadas aún.<br />
                ¡Publica la primera ayudantía! 🚀
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {ayudantias.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-semibold text-duoc-blue">{a.materia}</h2>
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 w-fit">
                    {a.dia ? new Date(a.dia).toLocaleDateString() : "Sin fecha"}
                  </span>
                  <div className="text-sm text-duoc-blue/80">Por: <span className="font-medium">{a.autor?.nombre ?? ""}</span></div>
                  <div className="text-sm">Horario: <span className="font-medium">{a.horario}</span></div>
                  <div className="text-sm">Lugar: <span className="font-medium">{a.lugar}</span></div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-duoc-blue !text-white px-2 py-1 rounded-full text-sm">
                      Cupos: {a.inscritos} / {a.cupo}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className={`inline-block px-4 py-2 rounded-lg font-semibold transition w-fit cursor-pointer ${a.inscritos >= a.cupo ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-duoc-yellow text-duoc-blue hover:bg-duoc-blue hover:text-white"}`}
                      onClick={() => handleUnirse(a)}
                      disabled={a.inscritos >= a.cupo}
                    >
                      {a.inscritos >= a.cupo ? "Sin cupos" : "Unirme"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {modal.open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs text-center">
                <p className="text-duoc-blue font-semibold mb-4">{modal.message}</p>
                <button
                  onClick={closeModal}
                  className="mt-2 px-4 py-2 bg-duoc-blue text-white rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Botón flotante eliminado para consistencia */}
      </main>
    </AuthGuard>
  );
}
