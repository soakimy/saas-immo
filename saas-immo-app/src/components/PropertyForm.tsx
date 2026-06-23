"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const PROPERTY_TYPES = [
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
  { value: "terrain", label: "Terrain" },
  { value: "local", label: "Local commercial" },
];

export default function PropertyForm({ agencyId }: { agencyId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    type: "appartement",
    transaction_type: "vente",
    title: "",
    price: "",
    surface_m2: "",
    rooms: "",
    address: "",
    city: "",
    postal_code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.from("properties").insert({
      agency_id: agencyId,
      type: form.type,
      transaction_type: form.transaction_type,
      title: form.title || null,
      price: form.price ? Number(form.price) : null,
      surface_m2: form.surface_m2 ? Number(form.surface_m2) : null,
      rooms: form.rooms ? Number(form.rooms) : null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard/biens");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type de bien">
          <select
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transaction">
          <select
            value={form.transaction_type}
            onChange={(e) => update("transaction_type", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          >
            <option value="vente">Vente</option>
            <option value="location">Location</option>
          </select>
        </Field>
      </div>

      <Field label="Titre de l'annonce (optionnel)">
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Ex : Bel appartement lumineux avec balcon"
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Prix (€)">
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Surface (m²)">
          <input
            type="number"
            value={form.surface_m2}
            onChange={(e) => update("surface_m2", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Pièces">
          <input
            type="number"
            value={form.rooms}
            onChange={(e) => update("rooms", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
      </div>

      <Field label="Adresse">
        <input
          type="text"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Ville">
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Code postal">
          <input
            type="text"
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-clay" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Ajouter le bien"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {children}
    </div>
  );
}
