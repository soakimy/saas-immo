"use client";

import { useState } from "react";

export default function DraftMessageButton({ contactId }: { contactId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmingSend, setConfirmingSend] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    setSent(false);
    setConfirmingSend(false);

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

  async function handleSend() {
    if (!draft) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/contacts/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, subject: draft.subject, body: draft.body }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }

      setSent(true);
      setConfirmingSend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
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

          {sent ? (
            <p className="mt-3 text-sm text-sage font-medium">✓ Email envoyé.</p>
          ) : (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleCopy}
                className="text-sm bg-white border border-line text-ink rounded-md px-4 py-1.5 font-medium hover:border-clay/50 transition-colors"
              >
                {copied ? "Copié ✓" : "Copier"}
              </button>

              {!confirmingSend ? (
                <button
                  onClick={() => setConfirmingSend(true)}
                  className="text-sm bg-ink text-paper rounded-md px-4 py-1.5 font-medium hover:bg-ink/90 transition-colors"
                >
                  Envoyer par email
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink/60">Confirmer l&apos;envoi ?</span>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="text-sm font-medium text-clay hover:underline disabled:opacity-50"
                  >
                    {sending ? "Envoi..." : "Confirmer"}
                  </button>
                  <button
                    onClick={() => setConfirmingSend(false)}
                    className="text-sm text-ink/50 hover:text-ink"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-ink/40 mt-2">
            Relisez et adaptez le message avant de l&apos;envoyer.
          </p>
        </div>
      )}
    </div>
  );
}
