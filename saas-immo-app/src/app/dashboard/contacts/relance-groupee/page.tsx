import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import BulkMessageSelector from "@/components/BulkMessageSelector";

export default async function BulkMessagePage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, type")
    .eq("agency_id", profile.agency_id)
    .not("email", "is", null)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard/contacts" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux contacts
        </Link>
        <h1 className="font-display text-2xl text-ink mb-1">Relance groupée</h1>
        <p className="text-ink/60 mb-8">
          Sélectionnez les contacts à relancer. Vous pourrez relire et modifier chaque message avant l&apos;envoi.
        </p>

        <BulkMessageSelector contacts={contacts ?? []} />
      </section>
    </main>
  );
}
