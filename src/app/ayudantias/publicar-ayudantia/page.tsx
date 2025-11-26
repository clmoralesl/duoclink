 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "../../../components/AuthGuard";
import { getAuth } from "firebase/auth";

const MATERIAS = [
  "Matemáticas",
  "Física",
  "Química",
  "Programación",
  "Estadística",
  "Biología",
  "Historia",
  "Otra",
];

export default function PublicarAyudantiaPage() {
  const router = useRouter();
  const [materia, setMateria] = useState("");
  const [cupo, setCupo] = useState(1);
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFin, setHorarioFin] = useState("");
  const [dia, setDia] = useState("");
  const [lugar, setLugar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!materia) return setError("Selecciona una materia");
    if (cupo < 1 || cupo > 40) return setError("El cupo debe ser entre 1 y 40");
    if (!horarioInicio || !horarioFin) return setError("Completa el horario");
    if (horarioFin <= horarioInicio) return setError("El horario de fin debe ser después del inicio");
    if (!dia) return setError("Selecciona un día");
    if (!lugar) return setError("Ingresa el lugar");

    setLoading(true);
    try {
      const format24 = (t: string) => {
        const [h, m] = t.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
      };
      const user = getAuth().currentUser;
      const token = await user?.getIdToken();
      const res = await fetch("/api/ayudantias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          materia,
          cupo,
          horario: `${format24(horarioInicio)} a ${format24(horarioFin)}`,
          dia,
          lugar,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al publicar la ayudantía");
      }
      router.push("/ayudantias");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Error al publicar la ayudantía");
      } else {
        setError("Error al publicar la ayudantía");
      }
    }
    setLoading(false);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center justify-between">
            ✍️ Publicar Ayudantía
          </h1>
          <div className="bg-white rounded-xl shadow-md p-10">
            <h2 className="text-xl font-semibold mb-4 text-duoc-blue">Completa los datos de la ayudantía</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Materia</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={materia}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMateria(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {MATERIAS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Cupo (máx 40)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={cupo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCupo(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Horario inicio (24 hrs)</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={horarioInicio}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHorarioInicio(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Horario fin (24 hrs)</label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={horarioFin}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHorarioFin(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Día</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={dia}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDia(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-duoc-blue">Lugar</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue text-lg"
                    value={lugar}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLugar(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <div className="text-red-500 font-semibold">{error}</div>}
              <button
                type="submit"
                className="w-full md:w-auto bg-duoc-blue text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar ayudantía"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
