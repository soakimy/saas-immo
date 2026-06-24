"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Insights = {
  hotLeads: { id: string; contactId: string; name: string; score: number }[];
  staleContacts: { id: string; name: string }[];
  staleProperties: { id: string; title: string }[];
  upcomingVisitsToConfirm: number;
};

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/insights");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
        setInsights(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="border border-line rounded-lg bg-white p-6 mb-8">
        <p className="text-ink/40 text-sm">Analyse de votre activité...</p>
      </div>
    );
  }

  if (error || !insights) {
    return null; // on n'affiche pas de bloc si ça échoue, le reste du dashboard fonctionne sans
  }

  const hasNothingToShow =
    insights.hotLeads.length === 0 &&
    insights.staleContacts.length === 0 &&
    insights.staleProperties.length === 0 &&
    insights.upcomingVisitsToConfirm === 0;

  if (hasNothingToShow) {
    return (
      <div className="border border-line rounded-lg bg-white p-6 mb-8">
        <p className="text-ink/60 text-sm">
          Rien d&apos;urgent à signaler aujourd&apos;hui. Continuez à qualifier vos contacts pour des recommandations plus précises.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-lg bg-white p-6 mb-8 space-y-3">
      {insights.hotLeads.length > 0 && (
        <InsightRow icon="🔥">
          {insights.hotLeads.length} prospect{insights.hotLeads.length > 1 ? "s" : ""} très chaud
          {insights.hotLeads.length > 1 ? "s" : ""} :{" "}
          {insights.hotLeads.map((l, i) => (
            <span key={l.id}>
              <Link href={`/dashboard/contacts/${l.contactId}`} className="text-clay hover:underline">
                {l.name} ({l.score}%)
              </Link>
              {i < insights.hotLeads.length - 1 ? ", " : ""}
            </span>
          ))}
        </InsightRow>
      )}

      {insights.staleContacts.length > 0 && (
        <InsightRow icon="📞">
          {insights.staleContacts.length} relance{insights.staleContacts.length > 1 ? "s" : ""} recommandée
          {insights.staleContacts.length > 1 ? "s" : ""} :{" "}
          {insights.staleContacts.map((c, i) => (
            <span key={c.id}>
              <Link href={`/dashboard/contacts/${c.id}`} className="text-clay hover:underline">
                {c.name}
              </Link>
              {i < insights.staleContacts.length - 1 ? ", " : ""}
            </span>
          ))}{" "}
          n&apos;ont pas reçu de message depuis 7 jours ou plus.
        </InsightRow>
      )}

      {insights.staleProperties.length > 0 && (
        <InsightRow icon="🏠">
          {insights.staleProperties.map((p, i) => (
            <span key={p.id}>
              <Link href={`/dashboard/biens/${p.id}`} className="text-clay hover:underline">
                {p.title}
              </Link>
              {i < insights.staleProperties.length - 1 ? ", " : ""}
            </span>
          ))}{" "}
          sans nouveau prospect depuis 12 jours ou plus.
        </InsightRow>
      )}

      {insights.upcomingVisitsToConfirm > 0 && (
        <InsightRow icon="📅">
          {insights.upcomingVisitsToConfirm} visite{insights.upcomingVisitsToConfirm > 1 ? "s" : ""} à confirmer dans les 48 prochaines heures.{" "}
          <Link href="/dashboard/rendez-vous" className="text-clay hover:underline">
            Voir →
          </Link>
        </InsightRow>
      )}
    </div>
  );
}

function InsightRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="text-sm text-ink flex items-start gap-2">
      <span>{icon}</span>
      <span className="flex-1">{children}</span>
    </p>
  );
}
