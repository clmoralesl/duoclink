// src/app/home/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

type Note = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
};

type Carpool = {
  id: string;
  from: string;
  to: string;
  time: string;
  seats: number;
};

type Tutoring = {
  id: string;
  materia: string;
  dia: string;
  horario: string;
  cupo: number;
  autor: { nombre: string };
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"notes" | "carpool" | "tutoring">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [carpools, setCarpools] = useState<Carpool[]>([]);
  const [tutorings, setTutorings] = useState<Tutoring[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notesRes, carpoolsRes, tutoringsRes] = await Promise.all([
          fetch("/api/apuntes"),
          fetch("/api/viajes"),
          fetch("/api/ayudantias"),
        ]);

        if (notesRes.ok) setNotes(await notesRes.json());
        if (carpoolsRes.ok) setCarpools(await carpoolsRes.json());
        if (tutoringsRes.ok) setTutorings(await tutoringsRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Columna izquierda */}
          <aside className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md order-2 md:order-1">
            <h2 className="text-lg font-bold !text-duoc-blue">Menú</h2>
            <Link href="/perfil" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Perfil</Link>
            <Link href="/notificaciones" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Notificaciones</Link>
            <Link href="/configuraciones" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Configuración</Link>
          </aside>

          {/* Columna central */}
          <section className="md:col-span-2 flex flex-col gap-6 order-1 md:order-2">
            {/* Tabs */}
            <div className="flex gap-4 bg-white rounded-xl shadow-md p-2">
              {["notes", "carpool", "tutoring"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${activeTab === tab ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
                    }`}
                >
                  {tab === "notes" ? "Apuntes" : tab === "carpool" ? "Viajes" : "Ayudantías"}
                </button>
              ))}
            </div>

            {/* Botones de acción (Publicar) */}
            <div className="flex justify-start">
              {activeTab === "notes" && (
                <Link
                  href="/apuntes/create-note"
                  className="px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
                >
                  Publicar nuevo apunte
                </Link>
              )}
              {activeTab === "carpool" && (
                <Link
                  href="/viajes/publicar-viaje"
                  className="px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
                >
                  Publicar nuevo viaje
                </Link>
              )}
              {activeTab === "tutoring" && (
                <Link
                  href="/ayudantias/publicar-ayudantia"
                  className="px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
                >
                  Publicar nueva ayudantía
                </Link>
              )}
            </div>

            {/* Contenido según tab activo */}
            {loading ? (
              <p className="text-center text-gray-500">Cargando...</p>
            ) : (
              <div className="flex flex-col gap-4">
                {activeTab === "notes" && notes.map((note) => (
                  <Link key={note.id} href={`/apuntes/${note.id}`}>
                    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center cursor-pointer">
                      <div>
                        <p className="font-semibold text-duoc-blue">{note.title}</p>
                        <p className="text-gray-700 text-sm">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-duoc-yellow text-duoc-blue font-semibold px-3 py-1 rounded-lg capitalize">
                        {note.type}
                      </span>
                    </div>
                  </Link>
                ))}

                {activeTab === "carpool" && carpools.map((trip) => (
                  <div key={trip.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-duoc-blue">
                        {trip.from.split(',')[0]} → {trip.to.split(',')[0]}
                      </p>
                      <p className="text-gray-700 text-sm">Hora: {trip.time}</p>
                    </div>
                    <span className="bg-duoc-yellow text-duoc-blue font-semibold px-3 py-1 rounded-lg">
                      {trip.seats} asientos
                    </span>
                  </div>
                ))}

                {activeTab === "tutoring" && tutorings.map((tutor) => (
                  <Link key={tutor.id} href={`/ayudantias/${tutor.id}`}>
                    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center cursor-pointer">
                      <div>
                        <p className="font-semibold text-duoc-blue">{tutor.materia}</p>
                        <p className="text-gray-700 text-sm">
                          {tutor.autor?.nombre} • {tutor.dia} {tutor.horario}
                        </p>
                      </div>
                      <span className="bg-duoc-yellow text-duoc-blue font-semibold px-3 py-1 rounded-lg">
                        {tutor.cupo} cupos
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Botones "Ir a ..." */}
            <div className="mt-2">
              {activeTab === "notes" && (
                <Link
                  href="/apuntes"
                  className="inline-flex items-center gap-2 bg-duoc-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Ir a Apuntes
                </Link>
              )}
              {activeTab === "carpool" && (
                <Link
                  href="/viajes"
                  className="inline-flex items-center gap-2 bg-duoc-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Ir a Viajes
                </Link>
              )}
              {activeTab === "tutoring" && (
                <Link
                  href="/ayudantias"
                  className="inline-flex items-center gap-2 bg-duoc-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Ir a Ayudantías
                </Link>
              )}
            </div>
          </section>

          {/* Columna derecha */}
          <aside className="hidden md:flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md order-3">
            <h2 className="text-lg font-bold text-duoc-blue">Destacados</h2>
            <p className="text-gray-700">🚗 {carpools.length} viajes disponibles</p>
            <p className="text-gray-700">📘 {notes.length} apuntes recientes</p>
            <p className="text-gray-700">🎓 {tutorings.length} ayudantías activas</p>
          </aside>

        </div>
      </main>
    </AuthGuard>
  );
}