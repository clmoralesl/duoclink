import { NextResponse } from "next/server";
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: process.env.FIREBASE_PRIVATE_KEY
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID!,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
          })
        : applicationDefault(),
    });

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

type NoteType = "text" | "media" | "link" | "document";
interface FirestoreNoteRaw {
  titulo?: string;
  cuerpo?: string;
  tags?: string[] | string;
  tipo?: string;
  creado?: { toDate?: () => Date };
  userId?: string;
}

const isType = (v: unknown): v is NoteType =>
  v === "text" || v === "media" || v === "link" || v === "document";

const isStr = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw))
    return raw.filter(isStr).slice(0, 25);
  if (typeof raw === "string")
    return raw.split(",").map(t => t.trim()).filter(t => t !== "").slice(0, 25);
  return [];
}

function safeError(e: unknown): { code?: string; message?: string } {
  if (typeof e === "object" && e !== null) {
    const maybe = e as { code?: string; message?: string };
    return { code: maybe.code, message: maybe.message };
  }
  return {};
}

async function requireUser(req: Request) {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  try {
    return await adminAuth.verifyIdToken(h.slice(7));
  } catch {
    return null;
  }
}

// GET público (solo lectura)
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const doc = await adminDb.collection("notes").doc(id).get();
    if (!doc.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const data = doc.data() as FirestoreNoteRaw;
    const tipo: NoteType = isType(data.tipo) ? (data.tipo as NoteType) : "text";
    const cuerpo = isStr(data.cuerpo) ? data.cuerpo : "";
    const tags = parseTags(data.tags);
    return NextResponse.json({
      id: doc.id,
      type: tipo,
      title: data.titulo ?? "Sin título",
      body: tipo === "text" ? cuerpo : undefined,
      link: tipo !== "text" ? cuerpo : undefined,
      tags,
      createdAt: data.creado?.toDate?.()?.toISOString(),
      userId: data.userId,
    });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("GET /api/apuntes/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PUT requiere dueño
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("notes").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const original = snap.data() as FirestoreNoteRaw;
    if (original.userId !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });

    const contentType = req.headers.get("content-type") || "";
    let titulo = (original.titulo ?? "").trim();
    let tipo: NoteType = isType(original.tipo) ? (original.tipo as NoteType) : "text";
    let cuerpo = isStr(original.cuerpo) ? original.cuerpo : "";
    let tags: string[] = Array.isArray(original.tags) ? parseTags(original.tags) : [];

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      if (form.get("titulo")) titulo = String(form.get("titulo")).trim();
      if (form.get("tipo")) {
        const tStr = String(form.get("tipo")).trim();
        if (!isType(tStr)) return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
        tipo = tStr;
      }
      if (form.get("tags")) tags = parseTags(form.get("tags"));
      if (tipo === "text" && form.get("cuerpo"))
        cuerpo = String(form.get("cuerpo")).trim();
      else if (tipo === "link" && form.get("url"))
        cuerpo = String(form.get("url")).trim();
      else if ((tipo === "media" || tipo === "document") && form.get("url"))
        cuerpo = String(form.get("url")).trim();
    } else {
      const json = await req.json().catch(() => null) as Record<string, unknown> | null;
      if (!json) return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
      if (json.titulo && isStr(json.titulo)) titulo = json.titulo.trim();
      if (json.tipo && isStr(json.tipo)) {
        const tStr = json.tipo.trim();
        if (!isType(tStr)) return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
        tipo = tStr;
      }
      if (json.tags) tags = parseTags(json.tags);
      if (tipo === "text" && json.cuerpo && isStr(json.cuerpo)) cuerpo = json.cuerpo.trim();
      if (tipo === "link" && json.url && isStr(json.url)) cuerpo = json.url.trim();
      if ((tipo === "media" || tipo === "document") && json.url && isStr(json.url))
        cuerpo = json.url.trim();
    }

    await ref.update({
      titulo,
      cuerpo,
      tags,
      tipo,
      actualizado: new Date(),
    });

    return NextResponse.json({ id: id, titulo, tipo, tags }, { status: 200 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("PUT /api/apuntes/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// DELETE requiere dueño
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("notes").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const data = snap.data() as FirestoreNoteRaw;
    if (data.userId !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });

    await ref.delete();
    return NextResponse.json({ id: id, deleted: true }, { status: 200 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("DELETE /api/apuntes/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}