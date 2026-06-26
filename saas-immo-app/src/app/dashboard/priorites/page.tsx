import { requireAgency } from "@/lib/require-agency";
import { computePriorities } from "@/lib/compute-priorities";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";

const SIGNAL_STYLES: Record<string, { icon: string; color: string }> = {
  no_response: { icon: "○", color: "text-clay" },
  no_followup: { icon: "●", color: "text-clay" },
  hot_lead: { icon: "🔥", color: "text-sage" },
};

export default async function PrioritiesPage() {
  const { supabase, profile } = await requireAgency();
  const priorities = await computePriorities(supabase, profile.agency_id);

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour au dashboard
        </Link>
        <h1 className="font-display text-2xl text-ink mb-1">Top 5 à contacter aujourd&apos;hui</h1>
        <p className="text-ink/60 mb-8">
          Basé sur l&apos;ancienneté des relances, les visites sans suivi, et la qualification IA.
        </p>

        {priorities.length === 0 ? (
          <p className="text-ink/60 text-sm">
            Aucun contact ne nécessite d&apos;attention particulière aujourd&apos;hui.
          </p>
        ) : (
          <div className="space-y-3">
            {priorities.map((p, i) => (
              <Link
                key={p.id}
                href={`/dashboard/contacts/${p.id}`}
                className={`block rounded-lg bg-white p-4 border transition-colors hover:border-clay/60 ${
                  i === 0 ? "border-clay/40" : "border-line"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-display text-lg text-ink/30">{i + 1}</span>
                  <p className="font-medium text-ink">{p.name}</p>
                </div>
                <div className="space-y-1 pl-7">
                  {p.signals.map((s, j) => {
                    const style = SIGNAL_STYLES[s.type] ?? { icon: "•", color: "text-ink/50" };
                    return (
                      <p key={j} className={`text-sm flex items-center gap-2 ${style.color}`}>
                        <span className="text-xs">{style.icon}</span>
                        <span className="text-ink/70">{s.label}</span>
                      </p>
                    );
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
