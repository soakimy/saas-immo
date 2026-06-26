"use client";

import { useState } from "react";

type Factor = { label: string; impact: "positive" | "negative" | "neutral"; detail: string };

const IMPACT_STYLES: Record<string, string> = {
  positive: "text-sage",
  negative: "text-clay",
  neutral: "text-ink/40",
};

const IMPACT_ICONS: Record<string, string> = {
  positive: "+",
  negative: "−",
  neutral: "•",
};

export default function ScoreExplanation({ factors }: { factors: Factor[] | null }) {
  const [open, setOpen] = useState(false);

  if (!factors || factors.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-ink/50 hover:text-ink underline"
      >
        {open ? "Masquer le détail" : "Pourquoi ce score ?"}
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 border border-line rounded-md p-3 bg-paper">
          {factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className={`font-medium ${IMPACT_STYLES[f.impact]}`}>{IMPACT_ICONS[f.impact]}</span>
              <div>
                <span className="text-ink font-medium">{f.label}</span>
                <span className="text-ink/60"> — {f.detail}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
