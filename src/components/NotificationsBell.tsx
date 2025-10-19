"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Tipo simple de notificación para demo
type Notification = {
    id: string;
    title: string;
    body?: string;
    dateISO: string;     // fecha en ISO para ordenar
    read?: boolean;
    href?: string;       // link opcional para “ver más”
};

// Datos mock; en producción se reemplaza por fetch/Firestore
const seed: Notification[] = [
    { id: "1", title: "Nueva ayudantía disponible", body: "Estructuras de datos, sala B203", dateISO: new Date().toISOString(), href: "/home#tutoring" },
    { id: "2", title: "Viaje confirmado", body: "Sede Maipú, 22/10 - 08:30", dateISO: new Date(Date.now() - 3600_000).toISOString(), href: "/viajes" },
    { id: "3", title: "Apunte compartido", body: "Programación avanzada", dateISO: new Date(Date.now() - 7200_000).toISOString(), href: "/apuntes" },
];

export default function NotificationsBell() {
    // Estado abierto/cerrado del panel
    const [open, setOpen] = useState(false);
    // Lista de notificaciones
    const [items, setItems] = useState<Notification[]>([]);
    // Ref del contenedor para detectar clicks fuera
    const rootRef = useRef<HTMLDivElement | null>(null);
    // Temporizador para delay en hover-out
    const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("duocNotif");
            const existing: Notification[] = raw ? JSON.parse(raw) : [];

            // map para preservar el estado read
            const readById = new Map(existing.map(n => [n.id, !!n.read]));

            // construye el nuevo conjunto (usa el seed actualizado)
            const updated = seed.map(s => ({
                ...s,
                read: readById.get(s.id) ?? s.read ?? false,
            }));

            // detecta si hay diferencias en los IDs
            const different = JSON.stringify(existing.map(n => n.id).sort()) !== JSON.stringify(seed.map(n => n.id).sort());

            // ordena por fecha desc
            const ordered = updated.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));

            // solo actualiza localStorage si hay nuevos o faltantes
            if (!raw || different) {
                localStorage.setItem("duocNotif", JSON.stringify(ordered));
            }

            setItems(ordered);
        } catch {
            const ordered = [...seed].sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
            localStorage.setItem("duocNotif", JSON.stringify(ordered));
            setItems(ordered);
        }
    }, []);
    useEffect(() => {
        // Cierra al hacer click fuera
        function onDocClick(e: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    // Manejo de hover con pequeño delay para que no parpadee
    const handleEnter = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setOpen(true);
    };
    const handleLeave = () => {
        hoverTimer.current = setTimeout(() => setOpen(false), 120);
    };

    // Indicador de cantidad no leída (demo)
    const unread = items.filter((n) => !n.read).length;

    return (
        <div
            ref={rootRef}
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {/* Botón campana */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="dialog"
                aria-expanded={open}
                className="relative p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-duoc-yellow"
                title="Notificaciones"
            >
                {/* Ícono campana (SVG) */}
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Badge de cantidad */}
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-duoc-yellow text-duoc-blue text-xs font-bold flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Panel flotante */}
            {open && (
                <div
                    role="dialog"
                    aria-label="Notificaciones"
                    className="absolute right-0 mt-3 w-80 max-w-[85vw] rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-[fadeIn_120ms_ease-out]"
                >
                    {/* Encabezado */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-duoc-blue font-semibold">Notificaciones</p>
                        <Link href="/notificaciones" className="text-xs text-duoc-blue/70 hover:underline">
                            Ver todas
                        </Link>
                    </div>

                    {/* Lista */}
                    <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                        {items.length === 0 && (
                            <li className="px-4 py-6 text-center text-sm text-gray-500">
                                No hay notificaciones
                            </li>
                        )}

                        {items.map((n) => {
                            const Content = () => (
                                <div className="flex items-start gap-3">
                                    <span
                                        className={`mt-1 w-2 h-2 rounded-full ${n.read ? "bg-gray-300" : "bg-duoc-yellow"
                                            }`}
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-duoc-blue">{n.title}</p>
                                        {n.body && <p className="text-sm text-gray-600">{n.body}</p>}
                                        <time className="text-xs text-gray-400 block mt-1">
                                            {new Date(n.dateISO).toLocaleString()}
                                        </time>
                                    </div>
                                </div>
                            );

                            return (
                                <li key={n.id} className="hover:bg-gray-50">
                                    {n.href ? (
                                        <Link
                                            href={n.href}
                                            className="block p-4 focus:outline-none focus:bg-gray-100 transition cursor-pointer"
                                            onClick={() => setOpen(false)} // cierra el panel al navegar
                                            aria-label={`Abrir: ${n.title}`}
                                        >
                                            <Content />
                                        </Link>
                                    ) : (
                                        <div className="p-4">
                                            <Content />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Acciones rápidas (demo) */}
                    <div className="px-4 py-2 border-t border-gray-100 text-right">
                        <button
                            onClick={() =>
                                setItems((prev) => {
                                    const updated = prev.map((x) => ({ ...x, read: true }));
                                    localStorage.setItem("duocNotif", JSON.stringify(updated));
                                    return updated;
                                })
                            }
                            className="text-xs text-duoc-blue hover:underline"
                        >
                            Marcar todas como leídas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}