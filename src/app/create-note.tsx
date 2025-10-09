"use client";

import { useState } from "react";

export default function CreateNote() {
  const [postType, setPostType] = useState<"text" | "media" | "link">("text");

  return (
    <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-duoc-blue mb-6">Crear nuevo apunte</h1>

        {/* Selector tipo de post */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPostType("text")}
            className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
              postType === "text"
                ? "bg-duoc-blue text-white"
                : "bg-duoc-gray text-duoc-blue hover:bg-duoc-yellow hover:text-duoc-blue"
            }`}
          >
            Texto
          </button>
          <button
            onClick={() => setPostType("media")}
            className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
              postType === "media"
                ? "bg-duoc-blue text-white"
                : "bg-duoc-gray text-duoc-blue hover:bg-duoc-yellow hover:text-duoc-blue"
            }`}
          >
            Imagen / Video
          </button>
          <button
            onClick={() => setPostType("link")}
            className={`px-4 py-2 rounded-lg font-semibold cursor-pointer ${
              postType === "link"
                ? "bg-duoc-blue text-white"
                : "bg-duoc-gray text-duoc-blue hover:bg-duoc-yellow hover:text-duoc-blue"
            }`}
          >
            Link
          </button>
        </div>

        {/* Formulario */}
        <form className="flex flex-col gap-4">
          {/* Título */}
          <input
            type="text"
            placeholder="Título del apunte"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
            required
          />

          {/* Body según tipo */}
          {postType === "text" && (
            <textarea
              placeholder="Escribe tu contenido aquí..."
              className="border rounded-lg p-3 h-40 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
            />
          )}

          {postType === "media" && (
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*,video/*"
                className="border rounded-lg p-3 cursor-pointer"
              />
              <textarea
                placeholder="Descripción (opcional)"
                className="border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
              />
            </div>
          )}

          {postType === "link" && (
            <div className="flex flex-col gap-3">
              <input
                type="url"
                placeholder="Pega tu enlace aquí"
                className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
              />
              <textarea
                placeholder="Descripción (opcional)"
                className="border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
              />
            </div>
          )}

          {/* Tags */}
          <input
            type="text"
            placeholder="Agrega tags separados por comas (ej: matemáticas, álgebra)"
            className="border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-duoc-blue"
          />

          {/* Botón publicar */}
          <button
            type="submit"
            className="px-6 py-3 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
          >
            Publicar
          </button>
        </form>
      </div>
    </main>
  );
}
