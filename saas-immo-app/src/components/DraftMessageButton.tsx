"use client";

import { useState } from "react";

export default function DraftMessageButton({ contactId }: { contactId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/contacts/draft-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }

      setDraft(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(`Sujet : ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="text-sm font-medium text-clay hover:underline disabled:opacity-50 disabled:no-underline"
      >
        {loading ? "Rédaction en cours..." : "✨ Rédiger une relance"}
      </button>

      {error && <p className="text-sm text-clay mt-2">{error}</p>}

      {draft && (
        <div className="mt-3 border border-line rounded-md p-4 bg-paper">
          <p className="text-xs text-ink/50 mb-1">Sujet</p>
          <input
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
          <p className="text-xs text-ink/50 mb-1">Message</p>
          <textarea
            value={draft.body}
            onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            rows={6}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
          />
          <button
            onClick={handleCopy}
            className="mt-3 text-sm bg-ink text-paper rounded-md px-4 py-1.5 font-medium hover:bg-ink/90 transition-colors"
          >
            {copied ? "Copié ✓" : "Copier le message"}
          </button>
          <p className="text-xs text-ink/40 mt-2">
            Relisez et adaptez avant d&apos;envoyer depuis votre messagerie habituelle.
          </p>
        </div>
      )}
    </div>
  );
}
