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

type AyudantiaRaw = {
  materia?: string;
  cupo?: number;
  inscritos?: number;
  horario?: string;
  dia?: string;
  lugar?: string;
  autor?: { uid: string; nombre: string };
  creado?: { toDate?: () => Date } | Date;
};

function safeError(e: unknown): { code?: string; message?: string } {
  if (typeof e === "object" && e !== null) {
    const maybe = e as { code?: string; message?: string };
    return { code: maybe.code, message: maybe.message };
  }
  return {};
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

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const doc = await adminDb.collection("ayudantias").doc(id).get();
    if (!doc.exists) return NextResponse.json({ message: "Ayudantía no encontrada" }, { status: 404 });
    const data = doc.data() as AyudantiaRaw;
    let createdAt: string | undefined = undefined;
    if (data.creado) {
      // Usar un tipo explícito para evitar 'any'
      if (typeof (data.creado as { toDate?: () => Date }).toDate === "function") {
        createdAt = (data.creado as { toDate: () => Date }).toDate().toISOString();
      } else if (data.creado instanceof Date) {
        createdAt = data.creado.toISOString();
      }
    }
    return NextResponse.json({
      id: doc.id,
      materia: data.materia ?? "",
      cupo: data.cupo ?? 0,
      inscritos: data.inscritos ?? 0,
      horario: data.horario ?? "",
      dia: data.dia ?? "",
      lugar: data.lugar ?? "",
      autor: data.autor ?? { uid: "", nombre: "" },
      createdAt,
    });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("GET /api/ayudantias/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// PUT solo autor
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("ayudantias").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Ayudantía no encontrada" }, { status: 404 });
    const original = snap.data() as AyudantiaRaw;
    if (!original.autor || original.autor.uid !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });

    const json = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!json) return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    const materia = typeof json.materia === "string" ? json.materia.trim() : original.materia;
    const cupo = typeof json.cupo === "number" ? json.cupo : original.cupo;
    const horario = typeof json.horario === "string" ? json.horario.trim() : original.horario;
    const dia = typeof json.dia === "string" ? json.dia.trim() : original.dia;
    const lugar = typeof json.lugar === "string" ? json.lugar.trim() : original.lugar;

    await ref.update({ materia, cupo, horario, dia, lugar, actualizado: new Date() });
    return NextResponse.json({ id, materia, cupo, horario, dia, lugar }, { status: 200 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("PUT /api/ayudantias/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// DELETE solo autor
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const ref = adminDb.collection("ayudantias").doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ message: "Ayudantía no encontrada" }, { status: 404 });
    const data = snap.data() as AyudantiaRaw;
    if (!data.autor || data.autor.uid !== user.uid)
      return NextResponse.json({ message: "Sin permiso" }, { status: 403 });
    await ref.delete();
    return NextResponse.json({ id, deleted: true }, { status: 200 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("DELETE /api/ayudantias/[id] error:", code, message);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
