"use client";

import { useState } from "react";

type Contact = { id: string; first_name: string | null; last_name: string | null; email: string | null; type: string };
type Draft = { contactId: string; name: string; email: string | null; subject?: string; body?: string; error?: string };

export default function BulkMessageSelector({ contacts }: { contacts: Contact[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerateDrafts() {
    if (selected.size === 0) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/contacts/bulk-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selected) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue.");

      setDrafts(data.drafts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function updateDraft(contactId: string, field: "subject" | "body", value: string) {
    setDrafts((prev) => prev?.map((d) => (d.contactId === contactId ? { ...d, [field]: value } : d)) ?? null);
  }

  async function handleSendOne(draft: Draft) {
    if (!draft.subject || !draft.body) return;
    setSendingIds((prev) => new Set(prev).add(draft.contactId));

    try {
      const res = await fetch("/api/contacts/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: draft.contactId, subject: draft.subject, body: draft.body }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue.");

      setSentIds((prev) => new Set(prev).add(draft.contactId));
    } catch (err: any) {
      setError(`Échec pour ${draft.name} : ${err.message}`);
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(draft.contactId);
        return next;
      });
    }
  }

  // Étape 1 : sélection des contacts
  if (!drafts) {
    return (
      <div>
        {contacts.length === 0 ? (
          <p className="text-sm text-ink/40 italic">
            Aucun contact avec une adresse email enregistrée.
          </p>
        ) : (
          <div className="border border-line rounded-lg bg-white divide-y divide-line mb-6">
            {contacts.map((c) => {
              const name = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "Contact sans nom";
              return (
                <label
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-paper transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="accent-clay"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">{name}</p>
                    <p className="text-xs text-ink/50">{c.email}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-clay mb-3">{error}</p>}

        <button
          onClick={handleGenerateDrafts}
          disabled={selected.size === 0 || generating}
          className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {generating
            ? `Génération en cours pour ${selected.size} contact${selected.size > 1 ? "s" : ""}...`
            : `Générer ${selected.size} brouillon${selected.size > 1 ? "s" : ""}`}
        </button>
      </div>
    );
  }

  // Étape 2 : relecture obligatoire avant tout envoi
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Relisez chaque message avant de l&apos;envoyer. Rien n&apos;est envoyé automatiquement.
      </p>

      {error && <p className="text-sm text-clay">{error}</p>}

      {drafts.map((d) => (
        <div key={d.contactId} className="border border-line rounded-lg bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-ink text-sm">{d.name}</p>
            {sentIds.has(d.contactId) && (
              <span className="text-xs text-sage font-medium">✓ Envoyé</span>
            )}
          </div>

          {d.error ? (
            <p className="text-sm text-clay">{d.error}</p>
          ) : !sentIds.has(d.contactId) ? (
            <>
              <input
                value={d.subject ?? ""}
                onChange={(e) => updateDraft(d.contactId, "subject", e.target.value)}
                className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink mb-2 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
              />
              <textarea
                value={d.body ?? ""}
                onChange={(e) => updateDraft(d.contactId, "body", e.target.value)}
                rows={4}
                className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink mb-2 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
              />
              <button
                onClick={() => handleSendOne(d)}
                disabled={sendingIds.has(d.contactId)}
                className="text-sm bg-ink text-paper rounded-md px-3 py-1.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {sendingIds.has(d.contactId) ? "Envoi..." : "Envoyer ce message"}
              </button>
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}
