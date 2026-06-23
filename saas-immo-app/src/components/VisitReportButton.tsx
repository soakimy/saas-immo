"use client";

import { useState } from "react";

export default function VisitReportButton({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/documents/visit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur inconnue.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compte-rendu-visite.pdf";
      link.click();
      URL.revokeObjectURL(url);

      setOpen(false);
      setNotes("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-clay hover:underline"
      >
        Compte-rendu PDF
      </button>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white border border-line rounded-md shadow-lg p-4 z-10">
      <p className="text-xs text-ink/50 mb-2">Remarques (optionnel)</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Impressions du visiteur, points à retenir..."
        className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink mb-3 focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
      />
      {error && <p className="text-sm text-clay mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-sm bg-ink text-paper rounded-md px-3 py-1.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Génération..." : "Générer le PDF"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-ink/60 hover:text-ink px-3 py-1.5"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
