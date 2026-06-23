"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function EditNotesForm({
  contactId,
  leadId,
  initialNotes,
  initialBudgetMin,
  initialBudgetMax,
}: {
  contactId: string;
  leadId: string | null;
  initialNotes: string;
  initialBudgetMin: number | null;
  initialBudgetMax: number | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [budgetMin, setBudgetMin] = useState(initialBudgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(initialBudgetMax?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);

    const { error: contactError } = await supabase
      .from("contacts")
      .update({ notes: notes || null })
      .eq("id", contactId);

    if (contactError) {
      setLoading(false);
      setError(contactError.message);
      return;
    }

    if (leadId) {
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          budget_min: budgetMin ? Number(budgetMin) : null,
          budget_max: budgetMax ? Number(budgetMax) : null,
        })
        .eq("id", leadId);

      if (leadError) {
        setLoading(false);
        setError(leadError.message);
        return;
      }
    }

    setLoading(false);
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-ink/50 hover:text-ink transition-colors"
      >
        Modifier les notes et le budget
      </button>
    );
  }

  return (
    <div className="space-y-3 border border-line rounded-md p-4 bg-paper">
      <div>
        <label className="block text-xs font-medium text-ink/60 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Urgence du projet, motivation, financement, échanges récents..."
          className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
      </div>

      {leadId && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Budget min (€)</label>
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Budget max (€)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-clay">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-sm bg-ink text-paper rounded-md px-4 py-1.5 font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-sm text-ink/60 hover:text-ink px-4 py-1.5"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
