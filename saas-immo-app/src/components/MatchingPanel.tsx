"use client";

import { useState } from "react";
import Link from "next/link";

type Match = {
  score: number;
  reason: string;
  contactId?: string;
  propertyId?: string;
  name?: string;
  title?: string;
};

export default function MatchingPanel({
  apiUrl,
  bodyKey,
  bodyValue,
  linkPrefix,
  emptyLabel,
}: {
  apiUrl: string;
  bodyKey: string;
  bodyValue: string;
  linkPrefix: string;
  emptyLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[] | null>(null);

  async function handleLoad() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: bodyValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }

      setMatches(data.matches);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 70) return "bg-sage/10 text-sage";
    if (score >= 50) return "bg-clay/10 text-clay";
    return "bg-ink/10 text-ink/60";
  }

  if (matches === null) {
    return (
      <button
        onClick={handleLoad}
        disabled={loading}
        className="text-sm font-medium text-clay hover:underline disabled:opacity-50"
      >
        {loading ? "Analyse en cours..." : "✨ Voir les correspondances"}
      </button>
    );
  }

  return (
    <div>
      {error && <p className="text-sm text-clay mb-2">{error}</p>}

      {matches.length === 0 ? (
        <p className="text-sm text-ink/40 italic">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <Link
              key={m.contactId ?? m.propertyId}
              href={`${linkPrefix}/${m.contactId ?? m.propertyId}`}
              className="flex items-center justify-between px-3 py-2 rounded-md border border-line hover:border-clay/50 bg-white transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-ink">{m.name ?? m.title}</p>
                <p className="text-xs text-ink/50">{m.reason}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${scoreColor(m.score)}`}>
                {m.score}%
              </span>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-ink/40 mt-2">
        Estimation indicative générée par l&apos;IA à partir des informations disponibles, pas un calcul garanti.
      </p>
    </div>
  );
}
