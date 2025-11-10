// Añade manejo de errores detallado y log para diagnosticar el 500 (probable PERMISSION_DENIED).
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

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NoteType = "text" | "media" | "link" | "document";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const isNoteType = (v: unknown): v is NoteType =>
  v === "text" || v === "media" || v === "link" || v === "document";

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter(isNonEmptyString).slice(0, 25);
  if (typeof raw === "string")
    return raw
      .split(",")
      .map(t => t.trim())
      .filter(isNonEmptyString)
      .slice(0, 25);
  return [];
}

async function verifyToken(req: Request) {
  const h = req.headers.get("authorization");
  if (!h || !h.startsWith("Bearer ")) return null;
  const token = h.slice(7);
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (e) {
    console.error("verifyIdToken error:", e);
    return null;
  }
}

export async function GET() {
  try {
    const snap = await adminDb
      .collection("notes")
      .orderBy("creado", "desc")
      .limit(50)
      .get();

    const notes = snap.docs.map(d => {
      const data = d.data() as any;
      const tipo: NoteType = isNoteType(data.tipo) ? data.tipo : "text";
      const cuerpo = typeof data.cuerpo === "string" ? data.cuerpo : "";
      const tags = parseTags(data.tags);
      return {
        id: d.id,
        type: tipo,
        title: data.titulo ?? "Sin título",
        body: tipo === "text" ? cuerpo : undefined,
        link: tipo !== "text" ? cuerpo : undefined,
        tags,
        createdAt: data.creado?.toDate?.().toISOString(),
      };
    });

    return NextResponse.json(notes);
  } catch (e: any) {
    console.error("GET /api/apuntes error:", e?.code, e?.message);
    return NextResponse.json({ message: "Error al obtener apuntes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const json = await req.json().catch(() => null);
    if (!json || typeof json !== "object")
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });

    const titulo = (json.titulo ?? "").trim();
    const tipoRaw = (json.tipo ?? "text").trim();
    const tags = parseTags(json.tags);

    if (!titulo) return NextResponse.json({ message: "Título requerido" }, { status: 400 });
    if (!isNoteType(tipoRaw)) return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });

    let cuerpo = "";
    if (tipoRaw === "text") {
      cuerpo = (json.cuerpo ?? "").trim();
      if (!cuerpo) return NextResponse.json({ message: "Contenido requerido" }, { status: 400 });
    } else {
      const url = (json.url ?? "").trim();
      if (!url) return NextResponse.json({ message: "URL requerida" }, { status: 400 });
      cuerpo = url;
    }

    const ref = await adminDb.collection("notes").add({
      titulo,
      cuerpo,
      tags,
      tipo: tipoRaw,
      creado: new Date(),
      userId: decoded.uid,
    });

    return NextResponse.json({ id: ref.id, titulo, tipo: tipoRaw, tags }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/apuntes error:", e?.code, e?.message);
    const status =
      e?.code === "permission-denied" ? 403 :
      e?.code === "invalid-argument" ? 400 :
      500;
    return NextResponse.json({ message: "Error interno" }, { status });
  }
}