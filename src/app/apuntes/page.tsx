"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/BackButton";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";
import { auth } from "@/lib/firebase";

type Note = {
  id: string;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  link?: string;
  tags: string[];
  createdAt?: string; // ISO string desde la API
};

export default function Apuntes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/apuntes");
      if (!res.ok) throw new Error("Error al cargar los apuntes");
      const items: Note[] = await res.json();
      setNotes(items);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("¿Seguro que deseas eliminar este apunte?");
    if (!ok) return;
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/apuntes/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } else {
      alert("Error al eliminar el apunte");
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="fixed top-4 right-4 z-50">
          <BotonCorazonFlotante />
        </div>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center justify-between">
            📚 Apuntes
            <div className="flex items-center gap-2">
              <button
                onClick={fetchNotes}
                className="text-sm px-3 py-1 rounded bg-white shadow hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer"
                title="Actualizar lista"
              >
                Actualizar
              </button>
            </div>
          </h1>

          <div className="flex justify-start">
            <Link
              href="/apuntes/create-note"
              className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:!text-white transition cursor-pointer"
            >
              Publicar nuevo apunte
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-lg text-gray-500">Cargando apuntes...</div>
          ) : notes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-duoc-blue text-lg">
                No hay apuntes publicados aún.
                <br />
                ¡Crea tu primer apunte desde “Publicar nuevo apunte”! 🚀
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
                    <p className="text-gray-700">
                      {note.body.length > 100 ? note.body.slice(0, 100) + "..." : note.body}
                    </p>
                  )}

                  {note.type === "link" && note.link && (
                    <a
                      href={note.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="!text-blue-600 underline break-all"
                    >
                      {note.link}
                    </a>
                  )}

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {note.tags.map((tag) => (
                        <span key={tag} className="bg-duoc-blue !text-white px-2 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link
                      href={`/apuntes/${note.id}`}
                      className="inline-block px-4 py-2 bg-duoc-blue !text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer"
                    >
                      Ver más
                    </Link>
                    <Link
                      href={`/apuntes/${note.id}/edit`}
                      className="inline-block px-4 py-2 bg-white border border-duoc-blue text-duoc-blue rounded-lg hover:bg-duoc-yellow transition w-fit cursor-pointer"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <BackButton href="/home" />
        </div>
      </main>
    </AuthGuard>
  );
}
