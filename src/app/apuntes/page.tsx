"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Note = {
  id: number;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  description?: string;
  link?: string; // Para apuntes tipo link
  tags: string[];
};

export default function Apuntes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    setNotes(storedNotes);
    setIsMounted(true);
  }, []);

  const clearAllNotes = () => {
    localStorage.removeItem("notes");
    setNotes([]);
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">📚 Apuntes</h1>
          <div className="text-center text-lg text-gray-500">Cargando apuntes...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center justify-between">
          📚 Apuntes
          <button
            onClick={clearAllNotes}
            className="text-gray-400 text-sm px-2 py-1 rounded hover:text-red-500 transition cursor-pointer"
            title="Limpiar todos los apuntes (solo desarrollo)"
          >
            🗑️
          </button>
        </h1>
        <div className="flex justify-start">
              <Link
                href="/create-note"
                className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
              >
                Publicar nuevo apunte
              </Link>
            </div>
        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-duoc-blue text-lg">
              No hay apuntes publicados aún.
              <br />
              ¡Crea tu primer apunte desde la sección “Nuevo Apunte”! 🚀
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-duoc-blue">
                  {note.title || "Sin título"}
                </h2>

                {/* Tipo en español */}
                <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 w-fit">
                  {note.type === "text"
                    ? "Texto"
                    : note.type === "media"
                    ? "Imagen/Video"
                    : note.type === "link"
                    ? "Enlace"
                    : "Documento"}
                </span>

                {/* Body */}
                {note.type === "text" && note.body && (
                  <p className="text-gray-700">
                    {note.body.length > 100 ? note.body.slice(0, 100) + "..." : note.body}
                  </p>
                )}

                {/* Description */}
                {note.description && (
                  <p className="text-gray-700">
                    {note.description.length > 100 ? note.description.slice(0, 100) + "..." : note.description}
                  </p>
                )}

                {/* Link */}
                {note.type === "link" && note.link && (
                  <a href={note.link} target="_blank" rel="noopener noreferrer" className="!text-blue-600 underline">
                    {note.link}
                  </a>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-duoc-blue !text-white px-2 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Ver detalle */}
                <Link
                  href={`/apuntes/${note.id}`}
                  className="mt-2 inline-block px-4 py-2 bg-duoc-blue !text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer"
                >
                  Ver más
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
