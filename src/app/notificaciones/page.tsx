// src/app/notificaciones/page.tsx
"use client";

import Link from "next/link";

type Notification = {
    id: string;
    title: string;
    body: string;
    dateISO: string;
    href?: string;
};

export default function NotificacionesPage() {
    // Mismas notificaciones que en la campanita
    const seed: Notification[] = [
        {
            id: "1",
            title: "Nueva ayudantía disponible",
            body: "Estructuras de datos, sala B203",
            dateISO: new Date().toISOString(),
            href: "/home#tutoring",
        },
        {
            id: "2",
            title: "Viaje confirmado",
            body: "Sede Maipú, 22/10 - 08:30",
            dateISO: new Date(Date.now() - 3600_000).toISOString(),
            href: "/viajes",
        },
        {
            id: "3",
            title: "Apunte compartido",
            body: "Programación avanzada",
            dateISO: new Date(Date.now() - 7200_000).toISOString(),
            href: "/apuntes",
        },
    ];

    // Formato de hora y fecha legible
    const formatDate = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleString("es-CL", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    return (
        <main className="min-h-screen bg-duoc-white flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-8">
                <h1 className="text-2xl font-bold text-duoc-blue mb-6 text-center">
                    Notificaciones
                </h1>

                {/* Tarjetas clickeables */}
                <div className="flex flex-col gap-4">
                    {seed.map((n) => {
                        const Card = (
                            <div className="bg-white rounded-2xl shadow-md flex justify-between items-center p-4 border border-gray-100 hover:bg-gray-50 transition">
                                <div>
                                    <h2 className="font-bold text-duoc-blue">{n.title}</h2>
                                    <p className="text-gray-700 text-sm">{n.body}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(n.dateISO)}
                                    </p>
                                </div>
                                <span className="bg-duoc-yellow text-duoc-blue px-3 py-1 rounded-xl font-mono text-sm font-semibold">
                                    Nuevo
                                </span>
                            </div>
                        );

                        // Si la notificación tiene href → clickeable
                        return n.href ? (
                            <Link
                                key={n.id}
                                href={n.href}
                                className="focus:outline-none focus:ring-2 focus:ring-duoc-yellow rounded-2xl"
                            >
                                {Card}
                            </Link>
                        ) : (
                            <div key={n.id}>{Card}</div>
                        );
                    })}
                </div>

                {/* Botón Volver igual al de Perfil */}
                <div className="mt-6 flex justify-center">
                    <Link
                        href="/home"
                        className="px-4 py-2 border border-gray-300 rounded-lg !text-black hover:bg-gray-50"
                    >
                        Volver
                    </Link>
                </div>
            </div>
        </main>
    );
}