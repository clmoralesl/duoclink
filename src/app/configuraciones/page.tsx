
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/BackButton";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Extras = {
    firstName?: string;
    lastName?: string;
    school?: string;
    avatarUrl?: string;
};

type Prefs = {
    notifications: boolean;
    darkMode: boolean;
    language: "es" | "en";
};

export default function ConfiguracionesPage() {
    // Estado visible del usuario: combina Firebase Auth + localStorage(duocUser)
    const [email, setEmail] = useState<string>("");
    const [extras, setExtras] = useState<Extras>({});
    const [loading, setLoading] = useState(true);

    // Preferencias persistidas en localStorage (duocPrefs)
    const [prefs, setPrefs] = useState<Prefs>({
        notifications: true,
        darkMode: false,
        language: "es",
    });

    // Carga de sesión + extras
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
            try {
                const raw = localStorage.getItem("duocUser");
                const local = raw ? (JSON.parse(raw) as Extras) : {};
                setExtras(local);

                setEmail(fbUser?.email ?? "");
            } finally {
                setLoading(false);
            }
        });
        return () => unsub();
    }, []);

    // Carga inicial de preferencias
    useEffect(() => {
        const saved = localStorage.getItem("duocPrefs");
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as Partial<Prefs>;
                setPrefs((p) => ({ ...p, ...parsed }));
            } catch {
                // Si hay error al parsear, se ignora y se mantienen defaults
            }
        }
    }, []);

    // Persistencia de preferencias
    const updatePref = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
        setPrefs((prev) => {
            const next = { ...prev, [key]: value };
            localStorage.setItem("duocPrefs", JSON.stringify(next));
            return next;
        });
    };

    // const handleLogout = async () => {
    //     await signOut(auth);
    //     // Navegación se deja a Navbar (redirige al /login); aquí basta cerrar sesión
    // };

    // Derivados para UI
    const fullName =
        `${extras.firstName ?? ""} ${extras.lastName ?? ""}`.trim() || "—";
    const initials = (() => {
        const a = (extras.firstName?.[0] ?? "").toUpperCase();
        const b = (extras.lastName?.[0] ?? "").toUpperCase();
        if (a || b) return `${a}${b || ""}`;
        const head = (email.split("@")[0] || "du").slice(0, 2).toUpperCase();
        return head;
    })();

    if (loading) {
        return (
            <AuthGuard>
                <main className="min-h-screen bg-duoc-gray pt-28 pb-10 px-6 text-duoc-blue">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse h-48" />
                        <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse h-48" />
                        <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse h-40" />
                    </div>
                </main>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <main className="min-h-screen bg-duoc-gray pt-28 pb-10 px-6 text-duoc-blue">

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Sección: Cuenta */}
                    <section className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Cuenta 🔒</h2>

                        <div className="flex gap-4 items-center mb-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-duoc-yellow bg-gray-100 flex items-center justify-center">
                                {extras.avatarUrl ? (
                                    <img
                                        src={extras.avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-bold">{initials}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Correo</p>
                                <p className="font-medium">{email || "—"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Nombre y apellido</p>
                                <p className="font-medium">{fullName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Escuela</p>
                                <p className="font-medium">
                                    {extras.school || "—"}
                                </p>
                            </div>
                            <div className="flex items-end">
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                                href="/cambiar-password"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-100 transition"
                            >
                                Cambiar contraseña
                            </Link>
                        </div>
                    </section>

                    {/* Sección: Preferencias */}
                    <section className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">Preferencias ⚙️</h2>

                        <div className="space-y-4">
                            {/* Notificaciones */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Notificaciones</p>
                                    <p className="text-sm text-gray-500">
                                        Habilita alertas de ayudantías, viajes y apuntes.
                                    </p>
                                </div>
                                <label className="inline-flex items-center cursor-pointer">
                                    {/* peer = input oculto */}
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={prefs.notifications}
                                        onChange={(e) => updatePref("notifications", e.target.checked)}
                                    />
                                    {/* track + knob como ::after */}
                                    <span
                                        className="
      relative inline-block w-11 h-6 rounded-full bg-gray-300 transition-colors
      peer-checked:bg-duoc-blue
      after:content-[''] after:absolute after:left-1 after:top-1
      after:w-4 after:h-4 after:rounded-full after:bg-white
      after:transition-transform after:duration-200 after:ease-out
      peer-checked:after:translate-x-6
    "
                                    />
                                </label>
                            </div>

                            {/* Modo oscuro (placeholder visual) */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Tema oscuro</p>
                                    <p className="text-sm text-gray-500">
                                        Usa colores oscuros para reducir fatiga visual (experimental).
                                    </p>
                                </div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={prefs.darkMode}
                                        onChange={(e) => updatePref("darkMode", e.target.checked)}
                                    />
                                    <span
                                        className="
      relative inline-block w-11 h-6 rounded-full bg-gray-300 transition-colors
      peer-checked:bg-duoc-blue
      after:content-[''] after:absolute after:left-1 after:top-1
      after:w-4 after:h-4 after:rounded-full after:bg-white
      after:transition-transform after:duration-200 after:ease-out
      peer-checked:after:translate-x-6
    "
                                    />
                                </label>
                            </div>

                            {/* Idioma */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Idioma</p>
                                    <p className="text-sm text-gray-500">
                                        Define el idioma de la interfaz.
                                    </p>
                                </div>
                                <select
                                    value={prefs.language}
                                    onChange={(e) =>
                                        updatePref("language", e.target.value as Prefs["language"])
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Sección: General */}
                    <section className="bg-white rounded-2xl shadow-md p-6">
                        <h2 className="text-xl font-bold mb-4">General 📱</h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <span className="text-gray-500">Versión de la app: </span>
                                <span className="font-medium">1.0.0</span>
                            </li>
                            <li>
                                <Link href="/terminos" className="text-duoc-blue hover:underline">
                                    Términos y condiciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacidad" className="text-duoc-blue hover:underline">
                                    Política de privacidad
                                </Link>
                            </li>
                        </ul>
                    </section>

                    {/* Botón volver (estilo unificado) */}
                    <div className="flex justify-center">
                        <BackButton label="Volver" />
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}