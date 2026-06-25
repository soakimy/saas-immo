"use client";

import { useEffect, useState } from "react";

export default function PortfolioAnalysis() {
  const [insights, setInsights] = useState<string[] | null>(null);
  const [tooFewData, setTooFewData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/portfolio-analysis");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur inconnue.");
        setInsights(data.insights);
        setTooFewData(data.tooFewData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (error) return null;

  if (tooFewData) {
    return (
      <p className="text-sm text-ink/40 italic">
        Ajoutez quelques biens supplémentaires pour voir apparaître des tendances de portefeuille.
      </p>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <p className="text-sm text-ink/40 italic">
        Pas de tendance marquante détectée dans votre portefeuille actuel.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map((insight, i) => (
        <p key={i} className="text-sm text-ink/80 flex items-start gap-2">
          <span>📊</span>
          <span>{insight}</span>
        </p>
      ))}
      <p className="text-xs text-ink/40 mt-2">
        Statistiques calculées sur votre portefeuille actuel, basées sur le nombre de demandes reçues par bien.
      </p>
    </div>
  );
}
