"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import BotonCorazonFlotante from "@/components/BotonCorazonFlotante";
import { auth } from "@/lib/firebase";

type NoteType = "text" | "media" | "link" | "document";
type Note = {
  id: string;
  type: NoteType;
  title: string;
  body?: string;
  link?: string;
  tags: string[];
};

export default function EditNote() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Campos
  const [type, setType] = useState<NoteType>("text"); // solo lectura visual
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(""); // para text
  const [linkUrl, setLinkUrl] = useState(""); // para link o media/doc actual
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Reemplazo de archivo
  const [file, setFile] = useState<File | null>(null);

  const [errors, setErrors] = useState({ title: "", body: "", linkUrl: "", file: "" });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/apuntes/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el apunte");
        const data: Note = await res.json();
        setType(data.type);
        setTitle(data.title);
        setBody(data.body || "");
        setLinkUrl(data.link || "");
        setTags(data.tags || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const addTag = () => {
    if (!tagInput.trim()) return;
    const newTags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length) {
      setTags([...tags, ...newTags]);
      setTagInput("");
    }
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  async function handleSave() {
    const nextErrors = { title: "", body: "", linkUrl: "", file: "" };
    let hasError = false;

    if (!title.trim()) {
      nextErrors.title = "El título es obligatorio";
      hasError = true;
    }
    if (type === "text" && !body.trim()) {
      nextErrors.body = "El contenido es obligatorio";
      hasError = true;
    }
    if (type === "link" && !linkUrl.trim()) {
      nextErrors.linkUrl = "La URL es obligatoria";
      hasError = true;
    }
    if ((type === "media" || type === "document") && file && file.size === 0) {
      nextErrors.file = "Archivo inválido";
      hasError = true;
    }

    setErrors(nextErrors);
    if (hasError) return;

    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      let res: Response;

      const headersBase: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (type === "text") {
        res = await fetch(`/api/apuntes/${id}`, {
          method: "PUT",
          headers: headersBase,
          body: JSON.stringify({
            titulo: title.trim(),
            tipo: "text",
            cuerpo: body.trim(),
            tags,
          }),
        });
      } else if (type === "link") {
        res = await fetch(`/api/apuntes/${id}`, {
          method: "PUT",
          headers: headersBase,
          body: JSON.stringify({
            titulo: title.trim(),
            tipo: "link",
            url: linkUrl.trim(),
            tags,
          }),
        });
      } else {
        if (file) {
          // Subida del archivo debe hacerse en cliente (Storage) -> obtener URL y mandar JSON
          // Aquí simplificamos: primero subir a Storage (implementa función aparte) y luego:
          // const nuevaUrl = await subirYObtenerURL(file, type);
          // res = await fetch(`/api/apuntes/${id}`, { method:"PUT", headers: headersBase, body: JSON.stringify({ titulo: title.trim(), url: nuevaUrl, tags }) });
          alert("Sube el archivo y envía su URL (ajusta lógica).");
          setSaving(false);
          return;
        } else {
          res = await fetch(`/api/apuntes/${id}`, {
            method: "PUT",
            headers: headersBase,
            body: JSON.stringify({
              titulo: title.trim(),
              tags,
            }),
          });
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Error al guardar");
        return;
      }
      router.push(`/apuntes/${id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4" />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4">
        <div className="fixed top-4 right-4 z-50">
          <BotonCorazonFlotante />
        </div>

        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-duoc-blue">Editar apunte</h1>

          <div className="text-sm text-gray-600">
            Tipo:{" "}
            <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700">
              {type === "text" ? "Texto" : type === "media" ? "Imagen/Video" : type === "link" ? "Enlace" : "Documento"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="Título *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-duoc-yellow"
              } text-duoc-blue`}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {type === "text" && (
            <div className="flex flex-col gap-1">
              <textarea
                placeholder="Contenido *"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 h-48 text-duoc-blue ${
                  errors.body ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-duoc-yellow"
                }`}
              />
              {errors.body && <p className="text-red-500 text-sm">{errors.body}</p>}
            </div>
          )}

          {type === "link" && (
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
          )}

          {(type === "media" || type === "document") && (
            <div className="flex flex-col gap-2">
              {linkUrl && (
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-fit px-3 py-1 bg-duoc-blue text-white rounded-md hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Ver archivo actual
                </a>
              )}
              <div>
                <label className="block font-semibold mb-2 text-duoc-blue">
                  {type === "media" ? "Reemplazar imagen/video (opcional)" : "Reemplazar documento (opcional)"}
                </label>
                <input
                  type="file"
                  accept={type === "media" ? "image/*,video/*" : ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
                {file && <p className="text-sm mt-1">{file.name}</p>}
              </div>
            </div>
          )}

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

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-duoc-blue text-white font-semibold rounded-lg shadow-md hover:bg-duoc-yellow hover:text-duoc-blue transition cursor-pointer disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => router.push(`/apuntes/${id}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}