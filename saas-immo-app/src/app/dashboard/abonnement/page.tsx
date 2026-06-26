import { requireAgency } from "@/lib/require-agency";
import DashboardHeader from "@/components/DashboardHeader";
import UpgradeButton from "@/components/UpgradeButton";

const PLAN_LABELS: Record<string, string> = {
  trial: "Essai gratuit",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default async function BillingPage() {
  const { supabase, profile } = await requireAgency();

  const { data: agency } = await supabase
    .from("agencies")
    .select("name, subscription_plan, subscription_status")
    .eq("id", profile.agency_id)
    .maybeSingle();

  const isPro = agency?.subscription_plan === "pro" && agency?.subscription_status === "active";

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl text-ink mb-8">Abonnement</h1>

        <div className="bg-white border border-line rounded-lg p-8 mb-6">
          <p className="text-ink/50 text-sm mb-1">Plan actuel</p>
          <p className="font-display text-2xl text-ink mb-1">
            {PLAN_LABELS[agency?.subscription_plan] ?? agency?.subscription_plan}
          </p>
          <p className="text-sm text-ink/60">
            Statut : {agency?.subscription_status === "active" ? "Actif" : agency?.subscription_status}
          </p>
        </div>

        {!isPro && (
          <div className="bg-white border border-line rounded-lg p-8">
            <p className="font-display text-lg text-ink mb-2">Passer au plan Pro</p>
            <p className="text-ink/60 text-sm mb-6">
              Biens illimités, contacts illimités, et toutes les fonctionnalités IA sans restriction.
            </p>
            <UpgradeButton />
          </div>
        )}
      </section>
    </main>
  );
}
