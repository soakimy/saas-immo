"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type ContactOption = { id: string; first_name: string | null; last_name: string | null };
type PropertyOption = { id: string; title: string | null; type: string; city: string | null };

export default function AppointmentForm({
  agencyId,
  contacts,
  properties,
  preselectedContactId,
}: {
  agencyId: string;
  contacts: ContactOption[];
  properties: PropertyOption[];
  preselectedContactId?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    type: "visit",
    contact_id: preselectedContactId ?? "",
    property_id: "",
    date: "",
    time: "",
    duration_minutes: "30",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.date || !form.time) {
      setError("La date et l'heure sont obligatoires.");
      return;
    }

    setLoading(true);

    const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString();

    const { error } = await supabase.from("appointments").insert({
      agency_id: agencyId,
      type: form.type,
      contact_id: form.contact_id || null,
      property_id: form.property_id || null,
      scheduled_at: scheduledAt,
      duration_minutes: Number(form.duration_minutes) || 30,
      notes: form.notes || null,
      status: "scheduled",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard/rendez-vous");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-8 space-y-5">
      <Field label="Type de rendez-vous">
        <select
          value={form.type}
          onChange={(e) => update("type", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        >
          <option value="visit">Visite</option>
          <option value="call">Appel</option>
          <option value="signing">Signature</option>
        </select>
      </Field>

      <Field label="Contact">
        <select
          value={form.contact_id}
          onChange={(e) => update("contact_id", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        >
          <option value="">Aucun contact</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Bien concerné">
        <select
          value={form.property_id}
          onChange={(e) => update("property_id", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        >
          <option value="">Aucun bien</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || `${p.type} — ${p.city || "ville non précisée"}`}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Heure">
          <input
            type="time"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Durée (min)">
          <input
            type="number"
            value={form.duration_minutes}
            onChange={(e) => update("duration_minutes", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
      </div>

      <Field label="Notes (optionnel)">
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
      </Field>

      {error && <p className="text-sm text-clay" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Planifier le rendez-vous"}
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
