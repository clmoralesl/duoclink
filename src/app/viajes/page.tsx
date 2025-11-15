"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import BackButton from "@/components/BackButton";
import Image from "next/image";

type Trip = {
  id: number;
  from: string;
  to: string;
  time: string;
  seats: number;
  notes?: string;
};

export default function ViajesPage() {
  const [trips, setTrips] = useState<Trip[]>([
    { id: 1, from: "Puente Alto", to: "Duoc UC Maipú", time: "08:00", seats: 2 },
    { id: 2, from: "Ñuñoa", to: "Duoc UC San Joaquín", time: "09:15", seats: 1 },
  ]);

  const [form, setForm] = useState<Omit<Trip, "id">>({
    from: "",
    to: "",
    time: "",
    seats: 1,
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "seats" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.from || !form.to || !form.time) return;
    setTrips((prev) => [{ id: Date.now(), ...form }, ...prev]);
    setForm({ from: "", to: "", time: "", seats: 1, notes: "" });
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-duoc-gray pt-25 pb-10 px-4 text-duoc-blue">
        <section className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Viajes</h1>
          <p className="text-duoc-blue/80 mb-8">
            Crea un viaje compartido o únete a uno existente.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Crear viaje</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="from" className="block text-sm font-medium mb-1">
                      Origen
                    </label>
                    <input
                      id="from"
                      type="text"
                      value={form.from}
                      onChange={handleChange}
                      placeholder="Comuna o dirección"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="to" className="block text-sm font-medium mb-1">
                      Destino
                    </label>
                    <input
                      id="to"
                      type="text"
                      value={form.to}
                      onChange={handleChange}
                      placeholder="Sede o dirección"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium mb-1">
                      Hora de salida
                    </label>
                    <input
                      id="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                    />
                  </div>
                  <div>
                    <label htmlFor="seats" className="block text-sm font-medium mb-1">
                      Cupos
                    </label>
                    <input
                      id="seats"
                      type="number"
                      min={1}
                      max={6}
                      value={form.seats}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Punto de encuentro, aporte combustible, etc."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-duoc-yellow text-duoc-blue"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-duoc-blue text-white px-5 py-2 rounded-lg font-semibold hover:bg-duoc-yellow hover:text-duoc-blue transition"
                >
                  Publicar viaje
                </button>
              </form>
            </div>

            {/* Mapa (imagen placeholder recortada) */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4">Mapa</h2>
              <div className="relative h-[360px] w-full rounded-lg overflow-hidden bg-duoc-gray/40">
                <Image
                  src="/images/map.png"
                  alt="Mapa de referencia"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Listado de viajes */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Viajes disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {trips.map((t) => (
                <article key={t.id} className="bg-white rounded-xl shadow-md p-5">
                  <h3 className="text-lg font-bold">{t.from} → {t.to}</h3>
                  <p className="text-sm mt-1">Salida: <span className="font-medium">{t.time}</span></p>
                  <p className="text-sm">Cupos: <span className="font-medium">{t.seats}</span></p>
                  {t.notes && <p className="text-sm mt-2 text-duoc-blue/80">{t.notes}</p>}
                  <button className="mt-4 w-full bg-duoc-yellow text-duoc-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                    Unirme
                  </button>
                </article>
              ))}
            </div>
          </div>
          <BackButton href="/home"/>
        </section>
      </main>
    </AuthGuard>
  );
}