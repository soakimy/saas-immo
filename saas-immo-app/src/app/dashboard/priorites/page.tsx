import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import PriorityList from "@/components/PriorityList";

export default async function PrioritiesPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

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

        <PriorityList />
      </section>
    </main>
  );
}
