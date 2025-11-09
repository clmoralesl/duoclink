"use client";

import { useEffect, useState } from "react";

interface ModalFarmaciasDeTurnoProps {
    onClose: () => void;
}

interface FarmaciaTurno {
    local_id: string;
    local_nombre: string;
    comuna_nombre: string;
    local_direccion: string;
    local_telefono: string | null;
    funcionamiento_hora_apertura: string;
    funcionamiento_hora_cierre: string;
}

export default function ModalFarmaciasDeTurno({
    onClose,
}: ModalFarmaciasDeTurnoProps) {
    const [farmacias, setFarmacias] = useState<FarmaciaTurno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comunaSeleccionada, setComunaSeleccionada] = useState("Todas");

    useEffect(() => {
        async function cargarFarmacias() {
            try {
                setLoading(true);
                setError("");

                const res = await fetch(
                    "https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php",
                    { cache: "no-store" }
                );

                if (!res.ok) throw new Error("Error al consultar la API");

                const data = await res.json();
                setFarmacias(data);
            } catch (e) {
                console.error(e);
                setError("No se pudieron cargar las farmacias de turno.");
            } finally {
                setLoading(false);
            }
        }

        cargarFarmacias();
    }, []);

    const comunas = Array.from(new Set(farmacias.map((f) => f.comuna_nombre))).sort();

    const farmaciasFiltradas =
        comunaSeleccionada === "Todas"
            ? farmacias
            : farmacias.filter((f) => f.comuna_nombre === comunaSeleccionada);

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px] pointer-events-auto"
                onClick={onClose}
            />
            <div
                className="
          absolute top-20 right-4
          w-[90%] max-w-md
          bg-white rounded-2xl shadow-2xl
          p-5
          border border-gray-200
          animate-slide-in-right-dl
          pointer-events-auto
        "
            >
                <div className="flex items-center justify-between gap-3 mb-3">
                    <h2 className="text-xl font-bold text-duoc-blue">
                        Farmacias de turno
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {loading && (
                    <p className="text-gray-600 text-sm">
                        Cargando farmacias de turno...
                    </p>
                )}

                {error && (
                    <p className="text-red-600 text-sm">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <div className="mb-3 flex flex-col gap-1">
                            <label
                                htmlFor="comuna"
                                className="font-semibold text-duoc-blue text-xs"
                            >
                                Filtrar por comuna
                            </label>
                            <select
                                id="comuna"
                                value={comunaSeleccionada}
                                onChange={(e) => setComunaSeleccionada(e.target.value)}
                                className="
                  border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-duoc-yellow
                  text-duoc-blue
                "
                            >
                                <option value="Todas">Todas</option>
                                {comunas.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2">
                            {farmaciasFiltradas.length === 0 ? (
                                <p className="text-xs text-gray-500">
                                    No hay farmacias en esta comuna.
                                </p>
                            ) : (
                                farmaciasFiltradas.map((f) => (
                                    <div
                                        key={f.local_id}
                                        className="border border-gray-200 rounded-lg p-2 text-xs"
                                    >
                                        <p className="font-semibold text-duoc-blue">
                                            🏪 {f.local_nombre}
                                        </p>
                                        <p className="text-gray-700">📍 {f.local_direccion}</p>
                                        <p className="text-gray-700">🏙️ {f.comuna_nombre}</p>
                                        <p className="text-gray-500">
                                            ☎️{" "}
                                            {f.local_telefono && f.local_telefono.trim() !== ""
                                                ? f.local_telefono
                                                : "No hay teléfono registrado"}
                                        </p>
                                        <p className="text-gray-500">
                                            🕒 Horario: {f.funcionamiento_hora_apertura}AM -{" "}
                                            {f.funcionamiento_hora_cierre}PM
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}