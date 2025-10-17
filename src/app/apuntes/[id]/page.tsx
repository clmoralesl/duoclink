"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";

type Note = {
  id: string;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  link?: string;
  tags: string[];
  createdAt?: Date;
};

export default function NoteDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const ref = doc(db, "notes", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setNote(null);
        } else {
          const data = snap.data() as any;
          const tipo = (data.tipo ?? "text") as Note["type"];
          const cuerpo = typeof data.cuerpo === "string" ? data.cuerpo : "";
          setNote({
            id: snap.id,
            type: tipo,
            title: data.titulo ?? "Sin título",
            body: tipo === "text" ? cuerpo : undefined,
            link: tipo === "link" || tipo === "media" || tipo === "document" ? cuerpo : undefined,
            tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
            createdAt: data.creado?.toDate?.(),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-3xl mx-auto text-center text-gray-600">Cargando nota...</div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-lg text-gray-500">Nota no encontrada</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer"
          >
            Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-duoc-blue">{note.title || "Sin título"}</h1>

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
            <p className="text-gray-700 whitespace-pre-wrap">{note.body}</p>
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

          {(note.type === "media" || note.type === "document") && note.link && (
            <a
              href={note.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-duoc-blue !text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer"
            >
              Abrir archivo
            </a>
          )}

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {note.tags.map((tag) => (
                <span key={tag} className="bg-duoc-blue text-white px-2 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <Link
            href="/apuntes"
            className="mt-4 inline-block px-4 py-2 bg-duoc-blue !text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer"
          >
            Volver a Apuntes
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}
