"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type NoteType = "text" | "media" | "link" | "document";

export default function CreateNote() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NoteType>("text");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  // archivos
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  // estado UI
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ title: "", body: "", description: "", linkUrl: "", file: "" });

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  async function uploadToStorage(file: File, kind: "media" | "document") {
    const path = `notes/${kind}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  const handlePublish = async () => {
    const newErrors = { title: "", body: "", description: "", linkUrl: "", file: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = "El título es obligatorio";
      hasError = true;
    }
    if (activeTab === "text" && !body.trim()) {
      newErrors.body = "El contenido del apunte es obligatorio";
      hasError = true;
    }
    if (activeTab === "link" && !linkUrl.trim()) {
      newErrors.linkUrl = "La URL es obligatoria";
      hasError = true;
    }
    if (activeTab === "media" && !mediaFile) {
      newErrors.file = "Debes seleccionar una imagen o video";
      hasError = true;
    }
    if (activeTab === "document" && !docFile) {
      newErrors.file = "Debes seleccionar un documento";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setSubmitting(true);

      // Definir "cuerpo" según el tipo:
      // - text: contenido de texto
      // - link: URL
      // - media/document: URL subida a Storage
      let cuerpo = "";

      if (activeTab === "text") {
        cuerpo = body.trim();
      } else if (activeTab === "link") {
        cuerpo = linkUrl.trim();
      } else if (activeTab === "media" && mediaFile) {
        cuerpo = await uploadToStorage(mediaFile, "media");
      } else if (activeTab === "document" && docFile) {
        cuerpo = await uploadToStorage(docFile, "document");
      }

      await addDoc(collection(db, "notes"), {
        titulo: title.trim(),
        cuerpo,
        tags,
        tipo: activeTab,
        creado: serverTimestamp(),
      });

      // limpiar y redirigir
      setTitle("");
      setBody("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setLinkUrl("");
      setMediaFile(null);
      setDocFile(null);
      setErrors({ title: "", body: "", description: "", linkUrl: "", file: "" });

      router.push("/apuntes"); // ajusta a tu ruta de listado
    } catch (e) {
      setErrors((prev) => ({ ...prev, title: "Error al publicar. Intenta nuevamente." }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          {["text", "media", "link", "document"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as NoteType)}
              className={`px-4 py-2 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === tab ? "bg-duoc-blue text-white" : "!text-duoc-blue hover:bg-duoc-gray"
              }`}
            >
              {tab === "text" ? "Texto" : tab === "media" ? "Imagen / Video" : tab === "link" ? "Enlace" : "Documento"}
            </button>
          ))}
        </div>

        {/* Título */}
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Título del apunte *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-duoc-yellow"
            } text-duoc-blue`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Contenido por tipo */}
        {activeTab === "text" && (
          <div className="flex flex-col gap-1">
            <textarea
              placeholder="Escribe tu apunte aquí *"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 h-48 text-duoc-blue ${
                errors.body ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-duoc-yellow"
              }`}
            />
            {errors.body && <p className="text-red-500 text-sm">{errors.body}</p>}
          </div>
        )}

        {activeTab === "link" && (
          <>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 h-24 text-duoc-blue"
            />
            <div className="flex flex-col gap-1">
              <input
                type="url"
                placeholder="https:// *"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-duoc-blue ${
                  errors.linkUrl ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-duoc-yellow"
                }`}
              />
              {errors.linkUrl && <p className="text-red-500 text-sm">{errors.linkUrl}</p>}
            </div>
          </>
        )}

        {/* Media */}
        {activeTab === "media" && (
          <>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 h-24 text-duoc-blue"
            />
            <label className="block font-semibold mb-2 text-duoc-blue">Subir imagen o video</label>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="media-upload"
              className="inline-block px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
            >
              Seleccionar archivo
            </label>
            {mediaFile && <p className="text-sm mt-1">{mediaFile.name}</p>}
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </>
        )}

        {/* Documento */}
        {activeTab === "document" && (
          <>
            <textarea
              placeholder="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 h-24 text-duoc-blue"
            />
            <label className="block font-semibold mb-2 text-duoc-blue">Subir documento</label>
            <input
              id="doc-upload"
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="doc-upload"
              className="inline-block px-4 py-2 bg-duoc-yellow text-duoc-blue font-semibold rounded-lg shadow-md hover:bg-duoc-blue hover:text-white transition cursor-pointer"
            >
              Seleccionar documento
            </label>
            {docFile && <p className="text-sm mt-1">{docFile.name}</p>}
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </>
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
              placeholder="Agregar tag(s), separados por coma"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-duoc-blue"
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
        <button
          onClick={handlePublish}
          disabled={submitting}
          className="mt-4 px-6 py-3 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </main>
  );
}
