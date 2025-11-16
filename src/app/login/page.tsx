"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";

function PasswordInputWithCapsWarning(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const [capsOn, setCapsOn] = useState(false);
  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isOn =
      typeof e.getModifierState === "function" &&
      e.getModifierState("CapsLock");
    setCapsOn(!!isOn);
  };
  const handleBlur = () => setCapsOn(false);
  return (
    <div>
      <input
        {...props}
        type="password"
        onKeyDown={(e) => {
          handleKeyEvent(e);
          props.onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          handleKeyEvent(e);
          props.onKeyUp?.(e);
        }}
        onBlur={(e) => {
          handleBlur();
          props.onBlur?.(e);
        }}
      />
      <div className="h-5 mt-1">
        <p
          role="status"
          aria-live="polite"
          aria-hidden={!capsOn}
          className={`text-xs text-yellow-600 whitespace-nowrap transition-opacity ${
            capsOn ? "opacity-100" : "opacity-0"
          }`}
        >
          Aviso: las MAYÚS (Bloq Mayús) están activas.
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Redirección si ya hay sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/home");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

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

  // Estado de verificación con animación de carga institucional
  if (checking) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-duoc-yellow">
        <div
          className="h-14 w-14 rounded-full border-4 border-duoc-blue/30 border-t-duoc-blue animate-spin mb-4"
          aria-hidden="true"
        />
        <p
          className="text-duoc-blue font-medium text-sm"
          role="status"
          aria-live="polite"
        >
          Verificando sesión…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-duoc-white flex items-center justify-center px-4 pt-25 pb-10">
      <div className="fixed top-4 right-4 z-50">
        <BotonCorazonFlotante />
      </div>
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-3xl p-0 overflow-hidden">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-duoc-blue font-medium mb-1"
              >
                Contraseña
              </label>
              <PasswordInputWithCapsWarning
                id="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
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