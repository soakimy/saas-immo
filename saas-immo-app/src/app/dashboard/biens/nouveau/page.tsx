import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import PropertyForm from "@/components/PropertyForm";

export default async function NewPropertyPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard/biens" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux biens
        </Link>
        <h1 className="font-display text-2xl text-ink mb-8">Ajouter un bien</h1>

        <PropertyForm agencyId={profile.agency_id} />
      </section>
    </main>
  );
}
