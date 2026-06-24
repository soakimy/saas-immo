"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Priority = {
  id: string;
  name: string;
  priorityScore: number;
  signals: { type: string; label: string; daysAgo: number }[];
};

const SIGNAL_ICONS: Record<string, string> = {
  no_response: "⚠️",
  no_followup: "⚠️",
  hot_lead: "🔥",
};

export default function PriorityList() {
  const [priorities, setPriorities] = useState<Priority[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/priorities");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
        setPriorities(data.priorities);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <p className="text-ink/40 text-sm">Calcul des priorités du jour...</p>;
  }

  if (error) {
    return <p className="text-sm text-clay">{error}</p>;
  }

  if (!priorities || priorities.length === 0) {
    return (
      <p className="text-ink/60 text-sm">
        Aucun contact ne nécessite d&apos;attention particulière aujourd&apos;hui.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {priorities.map((p, i) => (
        <Link
          key={p.id}
          href={`/dashboard/contacts/${p.id}`}
          className="block border border-line rounded-lg bg-white p-4 hover:border-clay/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-ink">
              <span className="text-ink/40 mr-2">#{i + 1}</span>
              {p.name}
            </p>
          </div>
          <div className="space-y-1">
            {p.signals.map((s, j) => (
              <p key={j} className="text-sm text-ink/70 flex items-center gap-1.5">
                <span>{SIGNAL_ICONS[s.type] ?? "•"}</span>
                {s.label}
              </p>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
