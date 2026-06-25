"use client";

import { useEffect, useState } from "react";

type TimelineEvent = {
  type: "created" | "message" | "appointment" | "qualification";
  date: string;
  title: string;
  detail?: string;
};

const TYPE_ICONS: Record<string, string> = {
  created: "📝",
  message: "📧",
  appointment: "📅",
  qualification: "✨",
};

export default function ContactTimeline({ contactId }: { contactId: string }) {
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/contacts/timeline?contactId=${contactId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
        setEvents(data.events);
      } catch (err: any) {
        setError(err.message);
      }
    }
    load();
  }, [contactId]);

  if (error) return <p className="text-sm text-clay">{error}</p>;
  if (!events) return <p className="text-sm text-ink/40 italic">Chargement de l&apos;historique...</p>;

  if (events.length === 0) {
    return <p className="text-sm text-ink/40 italic">Aucune activité enregistrée.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-sm mt-0.5">{TYPE_ICONS[e.type]}</span>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-ink">{e.title}</p>
              <p className="text-xs text-ink/40 whitespace-nowrap">
                {new Date(e.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            {e.detail && <p className="text-sm text-ink/60 mt-0.5">{e.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
