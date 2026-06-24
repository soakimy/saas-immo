"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type PropertyOption = {
  id: string;
  title: string | null;
  type: string;
  city: string | null;
};

const CONTACT_TYPES = [
  { value: "lead", label: "Prospect" },
  { value: "client", label: "Client" },
  { value: "owner", label: "Propriétaire" },
  { value: "tenant", label: "Locataire" },
];

export default function ContactForm({
  agencyId,
  properties,
}: {
  agencyId: string;
  properties: PropertyOption[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    type: "lead",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    source: "",
    property_id: "",
    budget_min: "",
    budget_max: "",
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
    setLoading(true);

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert({
        agency_id: agencyId,
        type: form.type,
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        email: form.email || null,
        phone: form.phone || null,
        source: form.source || null,
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (contactError) {
      setLoading(false);
      setError(contactError.message);
      return;
    }

    // Si un bien a été sélectionné, on crée le lead qui relie le contact à ce bien
    if (form.property_id) {
      const { error: leadError } = await supabase.from("leads").insert({
        agency_id: agencyId,
        contact_id: contact.id,
        property_id: form.property_id,
        status: "new",
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
      });

      if (leadError) {
        setLoading(false);
        setError(
          "Le contact a été créé, mais l'association au bien a échoué : " +
            leadError.message
        );
        return;
      }
    }

    setLoading(false);
    router.push(`/dashboard/contacts/${contact.id}?justCreated=true`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-8 space-y-5">
      <Field label="Type de contact">
        <select
          value={form.type}
          onChange={(e) => update("type", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        >
          {CONTACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prénom">
          <input
            type="text"
            value={form.first_name}
            onChange={(e) => update("first_name", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Nom">
          <input
            type="text"
            value={form.last_name}
            onChange={(e) => update("last_name", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
        <Field label="Téléphone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
        </Field>
      </div>

      <Field label="Bien qui l'intéresse (optionnel)">
        <select
          value={form.property_id}
          onChange={(e) => update("property_id", e.target.value)}
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        >
          <option value="">Aucun bien associé</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title || `${p.type} — ${p.city || "ville non précisée"}`}
            </option>
          ))}
        </select>
        {properties.length === 0 && (
          <p className="text-xs text-ink/50 mt-1.5">
            Aucun bien dans votre portefeuille pour l&apos;instant.
          </p>
        )}
      </Field>

      {form.property_id && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Budget min (€)">
            <input
              type="number"
              value={form.budget_min}
              onChange={(e) => update("budget_min", e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
            />
          </Field>
          <Field label="Budget max (€)">
            <input
              type="number"
              value={form.budget_max}
              onChange={(e) => update("budget_max", e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
            />
          </Field>
        </div>
      )}

      <Field label="Source (optionnel)">
        <input
          type="text"
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
          placeholder="Ex : SeLoger, bouche-à-oreille, site web..."
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
      </Field>

      <Field label="Notes — plus vous en dites, mieux l'IA pourra qualifier ce contact">
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          placeholder="Ex : Cherche à acheter avant fin d'année, vend déjà son appartement actuel, a déjà visité 2 biens similaires, financement déjà validé par sa banque..."
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
        <p className="text-xs text-ink/50 mt-1.5">
          Indiquez par exemple : l&apos;urgence du projet, le niveau de motivation, si le financement est prêt, ou ce qui a été dit lors du premier contact.
        </p>
      </Field>

      {error && <p className="text-sm text-clay" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ink text-paper rounded-md py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Ajouter le contact"}
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
