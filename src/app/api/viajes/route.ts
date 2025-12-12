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

type ViajeRaw = {
  from?: string;
  to?: string;
  time?: string;
  seats?: number;
  notes?: string;
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
    const snap = await adminDb.collection("viajes").orderBy("creado", "desc").limit(50).get();
    const viajes = snap.docs.map(d => {
      const data = d.data() as ViajeRaw;
      let createdAt: string | undefined = undefined;
      if (data.creado) {
        if (typeof (data.creado as { toDate?: () => Date }).toDate === "function") {
          createdAt = (data.creado as { toDate: () => Date }).toDate().toISOString();
        } else if (data.creado instanceof Date) {
          createdAt = data.creado.toISOString();
        }
      }
      return {
        id: d.id,
        from: data.from ?? "",
        to: data.to ?? "",
        time: data.time ?? "",
        seats: data.seats ?? 0,
        notes: data.notes ?? "",
        autor: data.autor ?? { uid: "", nombre: "" },
        createdAt,
      };
    });
    return NextResponse.json(viajes);
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("GET /api/viajes error:", code, message);
    return NextResponse.json({ message: "Error al obtener viajes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const decoded = await verifyToken(req);
  if (!decoded) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json().catch(() => null) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ message: "JSON inválido" }, { status: 400 });

    const from = typeof body.from === "string" ? body.from.trim() : "";
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const time = typeof body.time === "string" ? body.time.trim() : "";
    const seats = typeof body.seats === "number" ? body.seats : Number(body.seats);
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!from) return NextResponse.json({ message: "Origen requerido" }, { status: 400 });
    if (!to) return NextResponse.json({ message: "Destino requerido" }, { status: 400 });
    if (!time) return NextResponse.json({ message: "Hora de salida requerida" }, { status: 400 });
    if (!seats || seats < 1 || seats > 6) return NextResponse.json({ message: "Cupos inválidos (1-6)" }, { status: 400 });

    const ref = await adminDb.collection("viajes").add({
      from,
      to,
      time,
      seats,
      notes,
      autor: { uid: decoded.uid, nombre: decoded.name || decoded.email || "Usuario" },
      creado: new Date(),
    });

    return NextResponse.json({ id: ref.id, from, to, time, seats, notes }, { status: 201 });
  } catch (e) {
    const { code, message } = safeError(e);
    console.error("POST /api/viajes error:", code, message);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
