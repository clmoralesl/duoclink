"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

type Note = {
  id: number;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  description?: string;
  link?: string; // Para tipo link
  tags: string[];
};

type Carpool = {
  id: number;
  from: string;
  to: string;
  time: string;
  seats: number;
};

type Tutoring = {
  id: number;
  subject: string;
  date: string;
  tutor: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"notes" | "carpool" | "tutoring">("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  
  // Ejemplos simulados
  const carpoolExamples: Carpool[] = [
    { id: 1, from: "Valparaíso", to: "Viña del Mar", time: "08:30 AM", seats: 3 },
    { id: 2, from: "Concepción", to: "Talcahuano", time: "02:00 PM", seats: 2 },
  ];

  const tutoringExamples: Tutoring[] = [
    { id: 1, subject: "Matemáticas", date: "2025-09-15 10:00", tutor: "Juan Pérez" },
    { id: 2, subject: "Programación", date: "2025-09-16 15:00", tutor: "María Gómez" },
  ];

  // Cargar apuntes desde localStorage
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(storedNotes);
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
            <Link href="/login" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Cerrar Sesión</Link>
          </aside>

          {/* Columna central */}
          <section className="md:col-span-2 flex flex-col gap-6 order-1 md:order-2">
            {/* Tabs */}
            <div className="flex gap-4 bg-white rounded-xl shadow-md p-2">
              {["notes", "carpool", "tutoring"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                    activeTab === tab ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
                  }`}
                >
                  {tab === "notes" ? "Apuntes" : tab === "carpool" ? "Viajes" : "Ayudantías"}
                </button>
              ))}
            </div>

            {/* Botón nuevo apunte */}
            {activeTab === "notes" && (
              <div className="flex justify-start">
                <Link
                  href="/create-note"
                  className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
                >
                  Publicar nuevo apunte
                </Link>
              </div>
            )}

            {/* Contenido según tab activo */}
            {activeTab === "notes" && (
              <>
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center">No hay apuntes publicados aún.</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-white p-6 rounded-xl shadow-md flex flex-col gap-3 hover:shadow-lg transition">
                        <h3 className="text-xl font-bold text-duoc-blue">{note.title || "Sin título"}</h3>

                        <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 w-fit">
                          {note.type === "text"
                            ? "Texto"
                            : note.type === "media"
                            ? "Imagen/Video"
                            : note.type === "link"
                            ? "Enlace"
                            : "Documento"}
                        </span>

                        {note.type === "text" && note.body && (
                          <p className="text-gray-700">{note.body.length > 100 ? note.body.slice(0, 100) + "..." : note.body}</p>
                        )}

                        {note.description && (
                          <p className="text-gray-700">{note.description.length > 100 ? note.description.slice(0, 100) + "..." : note.description}</p>
                        )}

                        {note.type === "link" && note.link && (
                          <a href={note.link} target="_blank" rel="noopener noreferrer" className="!text-blue-600 underline">{note.link}</a>
                        )}

                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {note.tags.map((tag) => (
                              <span key={tag} className="bg-duoc-blue text-white px-2 py-1 rounded-full text-sm">#{tag}</span>
                            ))}
                          </div>
                        )}

                        <Link href={`/apuntes/${note.id}`} className="mt-2 inline-block px-4 py-2 bg-duoc-blue text-duoc-gray rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer">
                          Ver más
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab: Viajes (Carpool) */}
            {activeTab === "carpool" && (
              <section>
                <div className="flex flex-col gap-4">
                  {carpoolExamples.map((trip) => (
                    <div key={trip.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-duoc-blue">{trip.from} → {trip.to}</p>
                        <p className="text-gray-700 text-sm">Hora: {trip.time}</p>
                      </div>
                      <span className="bg-duoc-yellow text-duoc-blue font-semibold px-3 py-1 rounded-lg">{trip.seats} asientos</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    href="/viajes"
                    className="inline-flex items-center gap-2 bg-duoc-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                  >
                    Ir a Viajes
                  </Link>
                </div>
              </section>
            )}

            {activeTab === "tutoring" && (
              <div className="flex flex-col gap-4">
                {tutoringExamples.map((tutor) => (
                  <div key={tutor.id} className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-duoc-blue">{tutor.subject}</p>
                      <p className="text-gray-700 text-sm">Tutor: {tutor.tutor}</p>
                      <p className="text-gray-700 text-sm">Fecha: {tutor.date}</p>
                    </div>
                    <span className="bg-duoc-yellow text-duoc-blue font-semibold px-3 py-1 rounded-lg">Disponible</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Columna derecha */}
          <aside className="hidden md:flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md order-3">
            <h2 className="text-lg font-bold text-duoc-blue">Destacados</h2>
            <p className="text-gray-700">🚗 3 viajes disponibles hoy</p>
            <p className="text-gray-700">📘 5 apuntes más votados</p>
            <p className="text-gray-700">🎓 2 ayudantías esta semana</p>
          </aside>

        </div>
      </main>
    </AuthGuard>
  );
}
