"use client";

import { useState } from "react";

export default function CreateNote() {
  const [activeTab, setActiveTab] = useState<"text" | "media" | "link" | "document">("text");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col gap-6">

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "text" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
            }`}
          >
            Texto
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "media" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
            }`}
          >
            Imagen / Video
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "link" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
            }`}
          >
            Link
          </button>
          <button
            onClick={() => setActiveTab("document")}
            className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === "document" ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
            }`}
          >
            Documento
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Título del apunte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
            <textarea
              placeholder="Escribe tu apunte aquí..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow h-48 text-duoc-blue"
            />
          </div>
        )}

        {activeTab === "media" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Título del apunte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
            <label className="block font-semibold mb-2 text-duoc-blue">Subir imagen o video</label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
            />
            <label
              htmlFor="media-upload"
              className="inline-block px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
            >
              Seleccionar archivo
            </label>
            <p className="mt-2 text-sm text-gray-600 text-duoc-blue">Formatos permitidos: JPG, PNG, MP4</p>
          </div>
        )}

        {activeTab === "link" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Título del apunte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
            <input
              type="url"
              placeholder="https://"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
          </div>
        )}

        {activeTab === "document" && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Título del documento"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
            <label className="block font-semibold mb-2 text-duoc-blue">Subir documento</label>
            <input
              id="doc-upload"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
            />
            <label
              htmlFor="doc-upload"
              className="inline-block px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
            >
              Seleccionar documento
            </label>
            <p className="mt-2 text-sm text-gray-600 text-duoc-blue">
              Formatos permitidos: PDF, Word, PowerPoint, Excel
            </p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-duoc-blue">Tags</label>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-duoc-blue text-white px-2 py-1 rounded-full cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                {tag} ✕
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Agregar tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Publicar */}
        <button className="mt-4 px-6 py-3 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer">
          Publicar
        </button>
      </div>
    </main>
  );
}
