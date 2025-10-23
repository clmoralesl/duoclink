"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import BackButton from "@/components/BackButton";

type User = {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    school?: string;
};

export default function PerfilPage() {
    // Estado que representa los datos visibles del perfil
    const [user, setUser] = useState<User | null>(null);
    // Estado de carga para evitar parpadeos mientras se resuelve la sesión
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Observa el estado de Auth y combina con localStorage como respaldo
        const unsub = onAuthStateChanged(auth, (fbUser) => {
            try {
                if (fbUser) {
                    // Construye datos base desde Auth
                    const base: User = {
                        email: fbUser.email ?? "",
                        // avatarUrl se define más abajo para priorizar lo de localStorage
                    };

                    // Completa con datos persistidos localmente (firstName, lastName, school, role, avatarUrl)
                    const raw = localStorage.getItem("duocUser");
                    const extras = raw ? (JSON.parse(raw) as User) : {};

                    // Prioriza avatarUrl desde localStorage; si no existe, usa photoURL de Firebase
                    setUser({
                        ...base,
                        avatarUrl: extras.avatarUrl ?? fbUser.photoURL ?? "",
                        firstName: extras.firstName ?? "",
                        lastName: extras.lastName ?? "",
                        role: extras.role ?? "Estudiante",
                        school: extras.school ?? "",
                    });
                } else {
                    // Si no hay sesión de Auth, intenta leer todo desde localStorage
                    const raw = localStorage.getItem("duocUser");
                    setUser(raw ? (JSON.parse(raw) as User) : null);
                }
            } finally {
                setLoading(false);
            }
        });

        // Limpia el listener de Auth al desmontar
        return () => unsub();
    }, []);

    // Cálculo de iniciales para avatar cuando no exista imagen
    const initials = (() => {
        const a = (user?.firstName?.[0] ?? "").toUpperCase();
        const b = (user?.lastName?.[0] ?? "").toUpperCase();
        if (a || b) return `${a}${b || ""}`;
        const mail = user?.email ?? "";
        const head = mail.split("@")[0] || "du";
        return head.slice(0, 2).toUpperCase();
    })();

    if (loading) {
        // Render de skeleton simple durante la carga
        return (
            <main className="min-h-screen bg-duoc-white flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8 animate-pulse space-y-6">
                    <div className="mx-auto w-36 h-36 rounded-full bg-gray-200" />
                    <ul className="space-y-3">
                        <li className="h-5 bg-gray-200 rounded" />
                        <li className="h-5 bg-gray-200 rounded" />
                        <li className="h-5 bg-gray-200 rounded" />
                        <li className="h-5 bg-gray-200 rounded" />
                    </ul>
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-duoc-white flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8">
                {/* Avatar centrado en la parte superior */}
                <div className="w-full flex justify-center mb-6">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-duoc-yellow bg-gray-100 flex items-center justify-center">
                        {user?.avatarUrl ? (
                            // Se usa <img> para evitar configuración adicional de next/image en esta vista
                            <img src={user.avatarUrl} alt="Avatar del usuario" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-duoc-blue">
                                {initials}
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista vertical con datos del usuario */}
                <ul className="text-duoc-blue space-y-2">
                    <li>
                        <span className="font-semibold">Nombre: </span>
                        <span>{user?.firstName || "Joel"}</span>
                    </li>
                    <li>
                        <span className="font-semibold">Apellido: </span>
                        <span>{user?.lastName || "Arancibia"}</span>
                    </li>
                    <li>
                        <span className="font-semibold">Correo: </span>
                        <span>{user?.email || "—"}</span>
                    </li>
                    <li>
                        <span className="font-semibold">Rol: </span>
                        <span>{user?.role || "Estudiante"}</span>
                    </li>
                    <li>
                        <span className="font-semibold">Escuela: </span>
                        <span>{user?.school || "Escuela de Informática y Telecomunicaciones"}</span>
                    </li>
                </ul>

                {/* Acciones básicas */}
                <div className="mt-6 flex gap-3">
                    <Link
                        href="/editar-perfil"
                        className="px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue"
                    >
                        Editar perfil
                    </Link>
                    <BackButton href="/home" layout="inline" variant="secondary" />
                </div>
            </div>
        </main>
    );
}