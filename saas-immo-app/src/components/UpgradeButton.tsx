"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Redirection..." : "Passer au plan Pro"}
      </button>
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
    </div>
  );
}
