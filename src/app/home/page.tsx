"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"notes" | "carpool" | "tutoring">("notes");

  return (
    <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Columna izquierda (Perfil / Notif / Config) */}
        <aside className="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md order-2 md:order-1">
          <h2 className="text-lg font-bold !text-duoc-blue">Menú</h2>
          <Link href="#" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Perfil</Link>
          <Link href="#" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Notificaciones</Link>
          <Link href="#" className="!text-duoc-blue visited:!text-duoc-blue hover:!text-duoc-yellow">Configuración</Link>
        </aside>

        {/* Columna central (Feed con tabs) */}
        <section className="md:col-span-2 flex flex-col gap-6 order-1 md:order-2">
          {/* Tabs */}
          <div className="flex gap-4 bg-white rounded-xl shadow-md p-2">
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === "notes" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
              }`}
            >
              Apuntes
            </button>
            <button
              onClick={() => setActiveTab("carpool")}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === "carpool" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
              }`}
            >
              Viajes
            </button>
            <button
              onClick={() => setActiveTab("tutoring")}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === "tutoring" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
              }`}
            >
              Ayudantías
            </button>
          </div>

          {/* Botón para publicar nuevo según tab */}
            {activeTab === "notes" && (
              <div className="flex justify-start">
                <Link
                  href="/create-note"
                  className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
                >
                  Publicar nuevo apunte
                </Link>
              </div>
            )}
          {activeTab === "carpool" && (
            <div className="flex justify-start">
              <button className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer">
                Publicar nuevo viaje
              </button>
            </div>
          )}
          {activeTab === "tutoring" && (
            <div className="flex justify-start gap-x-4">
              <button className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer">
                Publicar nueva ayudantía
              </button>
              <button className="mb-4 px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer">
                Publicar nueva solicitud de ayudantía
              </button>
            </div>
          )}

          {/* Contenido según tab activo */}
          {activeTab === "notes" && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Apunte 🗒️: Resumen códigos de Machine Learning</h3>
                <p className="text-gray-700">Maura publicó apunte en Machine Learning, pero se le cayó el internet.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver apunte
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Apunte 🗒️: Inglés - Present Perfect/Past Perfect</h3>
                <p className="text-gray-700">Carla publicó apunte en Ingles Intermedio.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver apunte
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Video 🎥: Introducción a aplicaciones móviles con Kotlin 📲</h3>
                <p className="text-gray-700">Luis publicó un video en Desarrollo de aplicaciones móviles.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver apunte
                </button>
              </div>
              {/* Botón ver todos */}
              <div className="flex justify-center">
                <button className="mt-4 px-6 py-2 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver todos los apuntes
                </button>
              </div>
            </>
          )}

          {activeTab === "carpool" && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Viaje disponible 🚗</h3>
                <p className="text-gray-700">María ofrece viaje desde Duoc a Placilla a las 22:30.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Unirme
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Viaje a Valparaíso 🚙</h3>
                <p className="text-gray-700">Andrés ofrece transporte desde Duoc a Valparaíso a las 21:00.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Unirme
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Ruta a Recreo 🚌</h3>
                <p className="text-gray-700">Sofía ofrece viaje desde Duoc a Recreo a las 20:30.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Unirme
                </button>
              </div>
              {/* Botón ver todos */}
              <div className="flex justify-center">
                <button className="mt-4 px-6 py-2 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver todos los viajes
                </button>
              </div>
            </>
          )}

          {activeTab === "tutoring" && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Nueva ayudantía 🎓</h3>
                <p className="text-gray-700">Pedro se ofrece para ayudar en Matemáticas este viernes.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Participar
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Solicitud: Ayudantía de Base de Datos 💻</h3>
                <p className="text-gray-700">Ana solicita ayudantía: "Necesito ayuda con packages y triggers".</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Participar
                </button>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold text-duoc-blue mb-2">Ayudantía Química 🧪</h3>
                <p className="text-gray-700">Carlos ayudará con ejercicios de Química General.</p>
                <button className="mt-3 px-4 py-2 bg-duoc-blue text-white rounded-lg hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Participar
                </button>
              </div>
              {/* Botón ver todos */}
              <div className="flex justify-center">
                <button className="mt-4 px-6 py-2 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
                  Ver todas las ayudantías
                </button>
              </div>
            </>
          )}
        </section>

        {/* Columna derecha (Widgets) */}
        <aside className="hidden md:flex flex-col gap-4 bg-white p-4 rounded-xl shadow-md order-3">
          <h2 className="text-lg font-bold text-duoc-blue">Destacados</h2>
          <p className="text-gray-700">🚗 3 viajes disponibles hoy</p>
          <p className="text-gray-700">📘 5 apuntes más votados</p>
          <p className="text-gray-700">🎓 2 ayudantías esta semana</p>
        </aside>

      </div>
    </main>
  );
}
