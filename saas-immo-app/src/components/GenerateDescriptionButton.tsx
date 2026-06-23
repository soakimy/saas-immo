"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateDescriptionButton({
  propertyId,
  hasDescription,
}: {
  propertyId: string;
  hasDescription: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/properties/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
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
        onClick={handleGenerate}
        disabled={loading}
        className="text-sm font-medium text-clay hover:underline disabled:opacity-50 disabled:no-underline"
      >
        {loading
          ? "Génération en cours..."
          : hasDescription
          ? "✨ Régénérer la description avec l'IA"
          : "✨ Générer la description avec l'IA"}
      </button>
      {error && <p className="text-sm text-clay mt-2">{error}</p>}
    </div>
  );
}
