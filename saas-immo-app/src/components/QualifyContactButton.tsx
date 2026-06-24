"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QualifyContactButton({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQualify() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contacts/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur inconnue.");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleQualify}
        disabled={loading}
        className="text-sm font-medium text-clay hover:underline disabled:opacity-50 disabled:no-underline"
      >
        {loading ? "Analyse en cours..." : "✨ Qualifier avec l'IA"}
      </button>
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
    </div>
  );
}
