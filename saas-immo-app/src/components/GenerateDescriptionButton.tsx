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
  const [info, setInfo] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setInfo(null);

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

      if (data.photosIgnored > 0) {
        setInfo(
          `Description basée sur les ${data.photosUsed} premières photos (${data.photosIgnored} autre${data.photosIgnored > 1 ? "s" : ""} non utilisée${data.photosIgnored > 1 ? "s" : ""}).`
        );
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
      {info && <p className="text-sm text-ink/50 mt-2">{info}</p>}
    </div>
  );
}
