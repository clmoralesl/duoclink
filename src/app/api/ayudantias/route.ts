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

export async function GET() {
  try {
    const snap = await adminDb.collection("ayudantias").orderBy("creado", "desc").limit(50).get();
    const ayudantias = snap.docs.map(d => {
      const data = d.data() as AyudantiaRaw;
      let createdAt: string | undefined = undefined;
      if (data.creado) {
        // Usar un tipo explícito para evitar 'any'
        if (typeof (data.creado as { toDate?: () => Date }).toDate === "function") {
          createdAt = (data.creado as { toDate: () => Date }).toDate().toISOString();
        } else if (data.creado instanceof Date) {
          createdAt = data.creado.toISOString();
        }
      }
      return {
        id: d.id,
        materia: data.materia ?? "",
        cupo: data.cupo ?? 0,
        inscritos: data.inscritos ?? 0,
        horario: data.horario ?? "",
        dia: data.dia ?? "",
        lugar: data.lugar ?? "",
        autor: data.autor ?? { uid: "", nombre: "" },
        createdAt,
      };
    });
    return NextResponse.json(ayudantias);
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("GET /api/ayudantias error:", code, message);
    return NextResponse.json({ message: "Error al obtener ayudantías" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ message: "JSON inválido" }, { status: 400 });

    const materia = typeof body.materia === "string" ? body.materia.trim() : "";
    const cupo = typeof body.cupo === "number" ? body.cupo : Number(body.cupo);
    const horario = typeof body.horario === "string" ? body.horario.trim() : "";
    const dia = typeof body.dia === "string" ? body.dia.trim() : "";
    const lugar = typeof body.lugar === "string" ? body.lugar.trim() : "";
    if (!materia) return NextResponse.json({ message: "Materia requerida" }, { status: 400 });
    if (!cupo || cupo < 1 || cupo > 40) return NextResponse.json({ message: "Cupo inválido" }, { status: 400 });
    if (!horario) return NextResponse.json({ message: "Horario requerido" }, { status: 400 });
    if (!dia) return NextResponse.json({ message: "Día requerido" }, { status: 400 });
    if (!lugar) return NextResponse.json({ message: "Lugar requerido" }, { status: 400 });

    const ref = await adminDb.collection("ayudantias").add({
      materia,
      cupo,
      inscritos: 0,
      horario,
      dia,
      lugar,
      autor: { uid: decoded.uid, nombre: decoded.name || decoded.email || "Usuario" },
      creado: new Date(),
    });

    return NextResponse.json({ id: ref.id, materia, cupo, horario, dia, lugar }, { status: 201 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("POST /api/ayudantias error:", code, message);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
