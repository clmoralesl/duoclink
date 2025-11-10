"use client";

import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";

type Note = {
  id: string;
  type: "text" | "media" | "link" | "document";
  title: string;
  body?: string;
  link?: string;
  tags: string[];
  createdAt?: string; // ISO string desde la API
};

export default function NoteDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    fetch(`/api/apuntes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar el apunte");
        return r.json();
      })
      .then((data) => {
        if (active) {
          setNote(data);
          setError("");
        }
      })
      .catch((e) => active && setError(e.message || "Error al cargar"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    const ok = window.confirm("¿Seguro que deseas eliminar este apunte?");
    if (!ok) return;
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`/api/apuntes/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.ok) {
      router.push("/apuntes");
    } else {
      alert("Error al eliminar el apunte");
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-gray-300 border-t-blue-500 mb-4" />
            <p className="text-sm text-gray-600" role="status" aria-live="polite">
              Cargando apunte….
            </p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
          <div className="py-10 text-center">
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
            >
              Volver
            </button>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!note) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
          <div className="py-10 text-center">
            <p className="text-sm text-gray-600">Apunte no encontrado.</p>
            <button
              onClick={() => router.push("/apuntes")}
              className="mt-4 px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Ir al listado
            </button>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="fixed top-4 right-4 z-50">
          <BotonCorazonFlotante />
        </div>

        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-duoc-blue">{note.title}</h1>
            <div className="flex gap-2">
              <Link
                href={`/apuntes/${note.id}/edit`}
                className="px-3 py-2 bg-white border border-duoc-blue text-duoc-blue rounded-lg hover:bg-duoc-yellow transition cursor-pointer"
              >
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>

          <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700 w-fit">
            {note.type === "text" ? "Texto" : note.type === "media" ? "Imagen/Video" : note.type === "link" ? "Enlace" : "Documento"}
          </span>

          {note.type === "text" && note.body && <p className="text-gray-700 whitespace-pre-wrap">{note.body}</p>}

          {note.type === "link" && note.link && (
            <a href={note.link} target="_blank" rel="noopener noreferrer" className="!text-blue-600 underline break-all">
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
                <span key={tag} className="bg-duoc-blue text-white px-2 py-1 rounded-full text-sm">#{tag}</span>
              ))}
            </div>
          )}

          <Link href="/apuntes" className="mt-4 inline-block px-4 py-2 bg-duoc-blue !text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition w-fit cursor-pointer">
            Volver a Apuntes
          </Link>
        </div>
      </main>
    </AuthGuard>
  );
}
