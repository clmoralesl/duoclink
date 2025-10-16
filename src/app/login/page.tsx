// Indica que este componente se renderiza en el cliente (necesario para hooks, localStorage, etc.)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  // Estado controlado del formulario (email y password)
  const [form, setForm] = useState({ email: "", password: "" });
  // Error global (para credenciales incorrectas o usuario no registrado)
  const [error, setError] = useState("");
  // Indica si se intentó enviar (para decidir cuándo mostrar errores por campo)
  const [submitted, setSubmitted] = useState(false);
  // Router de Next para navegar programáticamente
  const router = useRouter();

  // Crea un usuario de prueba en localStorage si no existe
  useEffect(() => {
    const existingUser = localStorage.getItem("duocUser");
    if (!existingUser) {
      const defaultUser = { email: "correo@duocuc.cl", password: "1234" };
      localStorage.setItem("duocUser", JSON.stringify(defaultUser));
      console.log("Usuario de prueba creado en localStorage");
    }
  }, []);

  // Handler para cambios en inputs
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Actualiza el campo correspondiente usando su id ("email" o "password")
    setForm({ ...form, [e.target.id]: e.target.value });
    // Limpia el error global al empezar a escribir nuevamente
    setError("");
  }

  // Valida el formulario completo antes de intentar "loguear"
  function validateForm() {
    // 1) Email no vacío
    if (!form.email.trim()) {
      return false;
    }
    // 2) Formato básico de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return false;
    }
    // 3) Password no vacío
    if (!form.password.trim()) {
      return false;
    }
    // Si todo bien, retorna true
    return true;
  }

  // Handler del submit del formulario
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();           // Evita recargar la página
    setSubmitted(true);           // Marca que ya intentaste enviar (para mostrar errores)
    setError("");                 // Limpia error global antes de validar

    // Si la validación falla, no continúa
    if (!validateForm()) return;

    // Simulación de autenticación leyendo un "usuario" guardado en localStorage
    const user = localStorage.getItem("duocUser");
    if (user) {
      // Parsea el JSON guardado
      const userData = JSON.parse(user);
      // Compara credenciales del form con las guardadas
      if (
        form.email === userData.email &&
        form.password === userData.password
      ) {
        setError("");            // Limpia error global
        router.push("/home");    // Redirige al home si coincide
      } else {
        // Si no coinciden, muestra mensaje de credenciales inválidas
        setError("Correo o contraseña incorrectos.");
      }
    } else {
      // Si no existe "duocUser" en localStorage
      setError("No hay usuario registrado.");
    }
  }

  // Regex de email para mostrar errores por campo (se repite aquí para el render condicional)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Mensaje de error específico del campo email (se muestra solo tras submit)
  const emailFieldError =
    submitted && !form.email.trim()
      ? "Por favor ingresa un correo."
      : submitted && !emailRegex.test(form.email)
      ? "Ingresa un correo válido."
      : "";

  // Mensaje de error específico del campo password (se muestra solo tras submit)
  const passwordFieldError =
    submitted && !form.password.trim() ? "Por favor ingresa una contraseña." : "";

  // Render del componente
  return (
    <main className="min-h-screen bg-duoc-white flex items-center justify-center px-4 pt-25 pb-10">
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-3xl p-0 overflow-hidden">
        {/* Columna del formulario */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-duoc-blue text-center mb-6">
            Iniciar Sesión
          </h1>

          {/* onSubmit usa handleSubmit para manejar validación y navegación */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Campo: Email */}
            <div>
              <label htmlFor="email" className="block text-duoc-blue font-medium mb-1">
                Correo
              </label>
              <input
                type="email"
                id="email" // importante: coincide con la clave del estado
                placeholder="correo@duocuc.cl"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                // aria-invalid indica si el valor actual es inválido (aquí solo chequea vacío)
                aria-invalid={submitted && !form.email.trim()}
              />
              {/* Mensaje de error para email (condicional) */}
              {emailFieldError && (
                <p className="text-red-600 text-sm mt-1" role="alert">
                  {emailFieldError}
                </p>
              )}
            </div>

            {/* Campo: Password */}
            <div>
              <label htmlFor="password" className="block text-duoc-blue font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password" // importante: coincide con la clave del estado
                placeholder="********"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                // aria-invalid indica si está vacío tras intentar enviar
                aria-invalid={submitted && !form.password.trim()}
              />
              {/* Mensaje de error para password (condicional) */}
              {passwordFieldError && (
                <p className="text-red-600 text-sm mt-1" role="alert">
                  {passwordFieldError}
                </p>
              )}
            </div>

            {/* Error global (credenciales inválidas o usuario no registrado) */}
            {error && (
              <p className="text-red-600 text-sm text-center" role="alert">{error}</p>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              className="mt-4 w-full bg-duoc-blue text-white py-2 rounded-lg font-semibold transition hover:bg-duoc-yellow hover:text-duoc-blue"
            >
              Entrar
            </button>
          </form>

          {/* Link a registro */}
          <p className="text-center text-duoc-blue mt-4">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-duoc-yellow font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>

        {/* Columna derecha con logo */}
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