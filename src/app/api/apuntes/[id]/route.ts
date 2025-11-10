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
const isType = (v: any): v is NoteType =>
  v === "text" || v === "media" || v === "link" || v === "document";
const isStr = (v: any): v is string => typeof v === "string" && v.trim() !== "";

const parseTags = (raw: any): string[] =>
  Array.isArray(raw)
    ? raw.filter(isStr).slice(0, 25)
    : typeof raw === "string"
    ? raw.split(",").map(t => t.trim()).filter(isStr).slice(0, 25)
    : [];

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
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const doc = await adminDb.collection("notes").doc(params.id).get();
    if (!doc.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const data = doc.data() || {};
    const tipo: NoteType = isType(data.tipo) ? data.tipo : "text";
    const cuerpo = isStr(data.cuerpo) ? data.cuerpo : "";
    return NextResponse.json({
      id: doc.id,
      type: tipo,
      title: data.titulo ?? "Sin título",
      body: tipo === "text" ? cuerpo : undefined,
      link: tipo !== "text" ? cuerpo : undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: data.creado?.toDate?.().toISOString(),
      userId: data.userId,
    });
  } catch (e) {
    console.error("GET /api/apuntes/[id] error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PUT requiere dueño
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("notes").doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const original = snap.data()!;
    if (original.userId !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });

    const contentType = req.headers.get("content-type") || "";
    let titulo = (original.titulo ?? "").trim();
    let tipo: NoteType = isType(original.tipo) ? original.tipo : "text";
    let cuerpo = isStr(original.cuerpo) ? original.cuerpo : "";
    let tags: string[] = Array.isArray(original.tags) ? original.tags : [];

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
      else if ((tipo === "media" || tipo === "document") && form.get("file")) {
        // Subida debería hacerse en cliente para simplicidad; aquí solo aceptar URL
        return NextResponse.json({ message: "Sube archivo desde cliente y envía URL" }, { status: 400 });
      }
    } else {
      const json = await req.json().catch(() => null);
      if (!json) return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
      if (json.titulo) titulo = String(json.titulo).trim();
      if (json.tipo) {
        const tStr = String(json.tipo).trim();
        if (!isType(tStr)) return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
        tipo = tStr;
      }
      if (json.tags) tags = parseTags(json.tags);
      if (tipo === "text" && json.cuerpo) cuerpo = String(json.cuerpo).trim();
      if (tipo === "link" && json.url) cuerpo = String(json.url).trim();
      if ((tipo === "media" || tipo === "document") && (json.cuerpo || json.url)) {
        // Para media/document solo se cambia título/tags a menos que envíe nueva URL
        if (json.url) cuerpo = String(json.url).trim();
      }
    }

    await ref.update({
      titulo,
      cuerpo,
      tags,
      tipo,
      actualizado: new Date(),
    });

    return NextResponse.json({ id: params.id, titulo, tipo, tags }, { status: 200 });
  } catch (e) {
    console.error("PUT /api/apuntes/[id] error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// DELETE requiere dueño
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("notes").doc(params.id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Nota no encontrada" }, { status: 404 });
    const data = snap.data()!;
    if (data.userId !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });

    await ref.delete();
    return NextResponse.json({ id: params.id, deleted: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/apuntes/[id] error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}