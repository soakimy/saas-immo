import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import AppointmentForm from "@/components/AppointmentForm";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: { contact_id?: string };
}) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  const [{ data: contacts }, { data: properties }] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name")
      .eq("agency_id", profile.agency_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("properties")
      .select("id, title, type, city")
      .eq("agency_id", profile.agency_id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard/rendez-vous" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux rendez-vous
        </Link>
        <h1 className="font-display text-2xl text-ink mb-8">Planifier un rendez-vous</h1>

        <AppointmentForm
          agencyId={profile.agency_id}
          contacts={contacts ?? []}
          properties={properties ?? []}
          preselectedContactId={searchParams.contact_id}
        />
      </section>
    </main>
  );
}
