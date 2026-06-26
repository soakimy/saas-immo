"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function CloseAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClose(status: "done" | "no_show") {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-clay hover:underline"
      >
        Clôturer
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleClose("done")}
        disabled={loading}
        className="text-sm bg-sage/10 text-sage px-3 py-1 rounded-md font-medium hover:bg-sage/20 transition-colors disabled:opacity-50"
      >
        ✓ Terminé
      </button>
      <button
        onClick={() => handleClose("no_show")}
        disabled={loading}
        className="text-sm bg-clay/10 text-clay px-3 py-1 rounded-md font-medium hover:bg-clay/20 transition-colors disabled:opacity-50"
      >
        Absence du client
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-sm text-ink/50 hover:text-ink"
      >
        Annuler
      </button>
      {error && <span className="text-sm text-clay">{error}</span>}
    </div>
  );
}
