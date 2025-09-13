"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const user = localStorage.getItem("duocUser");
    if (user) {
      const userData = JSON.parse(user);
      if (
        form.email === userData.email &&
        form.password === userData.password
      ) {
        setError("");
        router.push("/home"); // <-- Cambia aquí
      } else {
        setError("Correo o contraseña incorrectos.");
      }
    } else {
      setError("No hay usuario registrado.");
    }
  }

  return (
    <main className="min-h-screen bg-duoc-white flex items-center justify-center px-4 pt-25 pb-10">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-3xl p-0 overflow-hidden">
        {/* Formulario */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-duoc-blue text-center mb-6">
            Iniciar Sesión
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-duoc-blue font-medium mb-1">
                Correo
              </label>
              <input
                type="email"
                id="email"
                placeholder="correo@duocuc.cl"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-duoc-blue font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              className="mt-4 w-full bg-duoc-blue text-white py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
            >
              Entrar
            </button>
          </form>
          <p className="text-center text-duoc-blue mt-4">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-duoc-yellow font-semibold hover:underline">
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