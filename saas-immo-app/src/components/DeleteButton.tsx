"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function DeleteButton({
  table,
  id,
  redirectTo,
  label = "Supprimer",
  confirmMessage = "Confirmer la suppression ? Cette action est définitive.",
}: {
  table: string;
  id: string;
  redirectTo: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from(table).delete().eq("id", id);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-ink/50 hover:text-clay transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-sm text-ink/60">{confirmMessage}</span>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm font-medium text-clay hover:underline disabled:opacity-50"
      >
        {loading ? "Suppression..." : "Confirmer"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="text-sm text-ink/50 hover:text-ink"
      >
        Annuler
      </button>
      {error && <span className="text-sm text-clay">{error}</span>}
    </div>
  );
}
