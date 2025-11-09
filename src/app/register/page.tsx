"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante"; // agregado

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    school: "",
  });
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    localStorage.setItem("duocUser", JSON.stringify(form));
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-duoc-gray flex items-center justify-center px-4 pt-25 pb-10">
      {/* Botón flotante en esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <BotonCorazonFlotante />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-duoc-blue text-center mb-6">
          Crear Cuenta
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName" className="block text-duoc-blue font-medium mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Tu nombre"
              value={form.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-duoc-blue font-medium mb-1">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Tu apellido"
              value={form.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
          </div>

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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-duoc-blue font-medium mb-1">
              Escuela
            </label>
            <select
              id="school"
              value={form.school}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            >
              <option value="">Selecciona tu escuela</option>
              <option value="Informática y Telecomunicaciones">Escuela de Informática y Telecomunicaciones</option>
              <option value="Administración y Negocios">Escuela de Administración y Negocios</option>
              <option value="Gastronomía y Turismo">Escuela de Gastronomía y Turismo</option>
              <option value="Arte y Diseño">Escuela de Arte y Diseño</option>
              <option value="Salud">Escuela de Salud</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-duoc-blue text-white py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-duoc-blue mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-duoc-yellow font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
