"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, limit, DocumentData } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/BackButton";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";

type Note = {
  id: string;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  link?: string;
  tags: string[];
  createdAt?: Date;
};

type FirestoreNote = {
  titulo?: string;
  cuerpo?: string;
  tags?: unknown;
  tipo?: "text" | "media" | "link" | "document";
  creado?: { toDate?: () => Date };
};

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.length > 0;

export default function Apuntes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotes() {
    setLoading(true);
    try {
      const ref = collection(db, "notes");
      const q = query(ref, orderBy("creado", "desc"), limit(20));
      const snap = await getDocs(q);
      const items: Note[] = snap.docs.map((d) => {
        const data = d.data() as FirestoreNote;
        const tipo = (data.tipo ?? "text") as Note["type"];
        const cuerpo = typeof data.cuerpo === "string" ? data.cuerpo : "";
        const tags = Array.isArray(data.tags) ? (data.tags as unknown[]).filter(isNonEmptyString) : [];
        return {
          id: d.id,
          type: tipo,
          title: data.titulo ?? "Sin título",
          body: tipo === "text" ? cuerpo : undefined,
          link: tipo === "link" ? cuerpo : undefined,
          tags,
          createdAt: data.creado?.toDate?.() ?? undefined,
        };
      });
      setNotes(items);
    } finally {
      setLoading(false);
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
              href="/create-note"
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
          <BackButton href="/home"/>
        </div>
      </main>
    </AuthGuard>
  );
}
