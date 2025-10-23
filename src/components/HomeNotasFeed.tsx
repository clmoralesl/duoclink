"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";

// Tipo de datos que usa el componente
type NoteCard = {
    id: string;
    title: string;
    type: "text" | "media" | "link" | "document";
    tags: string[];
    createdAt?: Date;
};

// Tipo que llega desde Firestore
type FirestoreNote = {
    titulo?: string;
    cuerpo?: string;
    tags?: unknown;
    tipo?: "text" | "media" | "link" | "document";
    creado?: Timestamp;
};

// Función auxiliar para validar strings
const isNonEmptyString = (v: unknown): v is string =>
    typeof v === "string" && v.length > 0;

/**
 * Componente reutilizable para mostrar apuntes desde Firestore.
 * Se usa tanto en la página Home como en la página Apuntes.
 */
export default function HomeNotesFeed({
    max = 6, // Límite de apuntes a mostrar (por defecto 6)
}: {
    max?: number;
}) {
    const [items, setItems] = useState<NoteCard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                // Consulta Firestore: colección "notes", ordenada por fecha descendente
                const q = query(
                    collection(db, "notes"),
                    orderBy("creado", "desc"),
                    limit(max)
                );
                const snap = await getDocs(q);

                // Se transforman los documentos en objetos legibles para el front
                const list: NoteCard[] = snap.docs.map((d) => {
                    const data = d.data() as FirestoreNote;
                    const tags = Array.isArray(data.tags)
                        ? (data.tags as unknown[]).filter(isNonEmptyString)
                        : [];

                    return {
                        id: d.id,
                        title: data.titulo ?? "Sin título",
                        type: (data.tipo ?? "text") as NoteCard["type"],
                        tags,
                        createdAt: data.creado?.toDate(),
                    };
                });

                setItems(list);
            } catch (error) {
                console.error("Error al cargar apuntes:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [max]);

    // Estado de carga
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: Math.min(max, 4) }).map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
                ))}
            </div>
        );
    }

    // Si no hay apuntes
    if (items.length === 0) {
        return (
            <p className="text-center text-gray-500">
                No hay apuntes publicados aún.
            </p>
        );
    }

    // Render de los apuntes
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((n) => (
                <Link
                    key={n.id}
                    href={`/apuntes/${n.id}`}
                    className="block bg-white rounded-2xl shadow p-4 border border-gray-100 hover:bg-gray-50 transition"
                >
                    {/* Título y tipo */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-duoc-blue font-semibold line-clamp-1">
                            {n.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                            {n.type === "text"
                                ? "Texto"
                                : n.type === "media"
                                    ? "Imagen/Video"
                                    : n.type === "link"
                                        ? "Enlace"
                                        : "Documento"}
                        </span>
                    </div>

                    {/* Tags */}
                    {n.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {n.tags.slice(0, 4).map((t) => (
                                <span
                                    key={t}
                                    className="bg-duoc-blue text-white px-2 py-0.5 rounded-full text-xs"
                                >
                                    #{t}
                                </span>
                            ))}
                            {n.tags.length > 4 && (
                                <span className="text-xs text-gray-500">
                                    +{n.tags.length - 4}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Fecha de creación */}
                    {n.createdAt && (
                        <p className="mt-2 text-xs text-gray-500">
                            {n.createdAt.toLocaleString("es-CL", {
                                dateStyle: "short",
                                timeStyle: "short",
                            })}
                        </p>
                    )}
                </Link>
            ))}
        </div>
    );
}