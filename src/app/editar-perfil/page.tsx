// src/app/editar-perfil/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
    school?: string;
};

export default function EditarPerfilPage() {
    // Estado de formulario para campos editables
    const [form, setForm] = useState<Required<Pick<User, "firstName" | "lastName" | "school">>>({
        firstName: "",
        lastName: "",
        school: "",
    });

    // URL del avatar mostrada en la vista (editable por URL)
    const [avatarUrl, setAvatarUrl] = useState<string>("");

    // Email leído para mostrar referencia (no editable en este formulario)
    const [email, setEmail] = useState<string>("");

    // Bandera de carga inicial para evitar parpadeos
    const [loading, setLoading] = useState<boolean>(true);

    // Mensaje de éxito tras guardar cambios
    const [saved, setSaved] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        // Se intenta leer el usuario almacenado localmente y se precargan los campos del formulario
        try {
            const raw = localStorage.getItem("duocUser");
            const u: User | null = raw ? JSON.parse(raw) : null;

            if (!u) {
                // En ausencia de usuario, se redirige al login para mantener consistencia de flujo
                router.replace("/login?next=/editar-perfil");
                return;
            }

            setForm({
                firstName: u.firstName ?? "",
                lastName: u.lastName ?? "",
                school: u.school ?? "",
            });

            setAvatarUrl(u.avatarUrl ?? "");
            setEmail(u.email ?? "");
        } catch {
            // En caso de error de parseo, se limpia el estado
            setForm({ firstName: "", lastName: "", school: "" });
            setAvatarUrl("");
            setEmail("");
        } finally {
            setLoading(false);
        }
    }, [router]);

    // Iniciales derivadas del nombre/apellido o del correo como respaldo
    const initials = useMemo(() => {
        const a = (form.firstName?.[0] ?? "").toUpperCase();
        const b = (form.lastName?.[0] ?? "").toUpperCase();
        if (a || b) return `${a}${b || ""}`;
        const head = email.split("@")[0] || "du";
        return head.slice(0, 2).toUpperCase();
    }, [form.firstName, form.lastName, email]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { id, value } = e.target;
        if (id === "avatarUrl") {
            setAvatarUrl(value);
            setSaved(false);
            return;
        }
        setForm((prev) => ({ ...prev, [id]: value }));
        setSaved(false);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Validación mínima de campos requeridos
        if (!form.firstName.trim() || !form.lastName.trim()) {
            alert("Nombre y apellido son obligatorios.");
            return;
        }

        try {
            // Se fusiona el objeto existente con los nuevos campos editados
            const raw = localStorage.getItem("duocUser");
            const current: User = raw ? JSON.parse(raw) : {};

            const updated: User = {
                ...current,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                school: form.school,
                avatarUrl: avatarUrl.trim(),
            };

            // Se persiste el usuario actualizado en localStorage
            localStorage.setItem("duocUser", JSON.stringify(updated));

            setSaved(true);

            // Navegación opcional al perfil tras guardar
            // router.push("/perfil");
        } catch (err) {
            alert("No fue posible guardar los cambios. Intente nuevamente.");
        }
    }

    if (loading) {
        // Render de skeleton simple durante la carga inicial
        return (
            <main className="min-h-screen bg-duoc-white flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8 animate-pulse space-y-6">
                    <div className="mx-auto w-36 h-36 rounded-full bg-gray-200" />
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded" />
                    <div className="h-10 bg-gray-200 rounded" />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-duoc-white flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl p-8">
                {/* Avatar centrado en la parte superior con vista previa de la URL */}
                <div className="w-full flex justify-center mb-6">
                    <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-duoc-yellow bg-gray-100 flex items-center justify-center">
                        {avatarUrl ? (
                            // Se usa <img> para evitar configuración adicional de next/image en esta vista
                            <img src={avatarUrl} alt="Avatar del usuario" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-duoc-blue">
                                {initials}
                            </div>
                        )}
                    </div>
                </div>

                {/* Formulario de edición de perfil (nombre, apellido, escuela, URL de avatar) */}
                <form onSubmit={handleSubmit} className="space-y-4 text-duoc-blue">
                    <div>
                        <label htmlFor="firstName" className="block font-medium mb-1">
                            Nombre
                        </label>
                        <input
                            id="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow"
                            placeholder="Joel"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block font-medium mb-1">
                            Apellido
                        </label>
                        <input
                            id="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow"
                            placeholder="Arancibia"
                        />
                    </div>

                    <div>
                        <label htmlFor="school" className="block font-medium mb-1">
                            Escuela
                        </label>
                        <select
                            id="school"
                            value={form.school}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow"
                        >
                            <option value="">Selecciona tu escuela</option>
                            <option value="Informática y Telecomunicaciones">Escuela de Informática y Telecomunicaciones</option>
                            <option value="Administración y Negocios">Escuela de Administración y Negocios</option>
                            <option value="Gastronomía y Turismo">Escuela de Gastronomía y Turismo</option>
                            <option value="Arte y Diseño">Escuela de Arte y Diseño</option>
                            <option value="Salud">Escuela de Salud</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="avatarUrl" className="block font-medium mb-1">
                            URL de foto de perfil (opcional)
                        </label>
                        <input
                            id="avatarUrl"
                            value={avatarUrl}
                            onChange={handleChange}
                            type="url"
                            placeholder="https://..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow"
                        />
                        <p className="text-sm text-gray-600 mt-1">
                            Al guardar, la imagen se guarda como URL en el perfil local. Para carga de archivo directa se recomienda Firebase Storage.
                        </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-duoc-blue text-white font-semibold hover:bg-duoc-yellow hover:text-duoc-blue"
                        >
                            Guardar cambios
                        </button>
                        {saved && <span className="text-green-700">Cambios guardados con éxito</span>}
                        <Link
                            href="/perfil"
                            className="ml-auto px-4 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50"
                        >
                            Volver
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}