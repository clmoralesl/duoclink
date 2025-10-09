"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedNotes: Note[] = JSON.parse(localStorage.getItem("notes") || "[]");
    const currentNote = storedNotes.find((n) => n.id === Number(id)) || null;
    setNote(currentNote);
  }, [id]);

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

        {/* Body */}
        {note.type === "text" && note.body && (
          <p className="text-gray-700 whitespace-pre-wrap">{note.body}</p>
        )}

        {/* Descripción */}
        {note.description && (
          <p className="text-gray-700 whitespace-pre-wrap">{note.description}</p>
        )}

        {/* Link */}
        {note.type === "link" && note.link && (
          <a
            href={note.link}
            target="_blank"
            rel="noopener noreferrer"
            className="!text-blue-600 underline mt-2"
          >
            {note.link}
          </a>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="bg-duoc-blue text-white px-2 py-1 rounded-full text-sm"
              >
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
  );
}
