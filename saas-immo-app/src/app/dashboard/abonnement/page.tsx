import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import UpgradeButton from "@/components/UpgradeButton";

const PLAN_LABELS: Record<string, string> = {
  trial: "Essai gratuit",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default async function BillingPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, agencies(name, subscription_plan, subscription_status)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  const agency = (profile as any).agencies;
  const isPro = agency?.subscription_plan === "pro" && agency?.subscription_status === "active";

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/dashboard" className="font-display text-xl text-ink">
            Bureau
          </Link>
          <SignOutButton />
        </div>
      </header>

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
