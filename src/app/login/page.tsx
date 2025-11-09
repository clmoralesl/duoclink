"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante"; // agregado

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      router.push("/home");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "unknown";
      const msg =
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Correo o contraseña inválidos."
          : code === "auth/user-not-found"
          ? "Usuario no encontrado."
          : code === "auth/too-many-requests"
          ? "Demasiados intentos. Intenta más tarde."
          : "No se pudo iniciar sesión. Intenta nuevamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-duoc-white flex items-center justify-center px-4 pt-25 pb-10">
      {/* Botón flotante en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <BotonCorazonFlotante />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-3xl p-0 overflow-hidden">
        {/* Formulario */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-duoc-blue text-center mb-6">
            Iniciar Sesión
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-duoc-blue font-medium mb-1"
              >
                Correo
              </label>
              <input
                type="email"
                id="email"
                placeholder="correo@duocuc.cl"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-duoc-blue font-medium mb-1"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-duoc-blue text-white py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition disabled:opacity-60"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
          <p className="text-center text-duoc-blue mt-4">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-duoc-yellow font-semibold hover:underline"
            >
              Regístrate
            </Link>
          </p>
        </div>
        {/* Logo grande a la derecha */}
        <div className="hidden md:flex flex-col justify-center items-center bg-duoc-yellow p-10 w-2/5">
          <Image
            src="/images/dllogo.png"
            alt="Duoc Link Logo"
            width={300}
            height={300}
            className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
          />
        </div>
      </div>
    </main>
  );
}