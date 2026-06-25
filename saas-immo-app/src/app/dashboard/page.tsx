import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import DashboardHeader from "@/components/DashboardHeader";
import InsightsPanel from "@/components/InsightsPanel";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md border border-line rounded-lg bg-white p-8">
          <p className="font-display text-xl text-ink mb-2">
            Erreur de chargement
          </p>
          <p className="text-ink/60 text-sm mb-6">{profileError.message}</p>
          <SignOutButton />
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md border border-line rounded-lg bg-white p-8">
          <p className="font-display text-xl text-ink mb-2">
            Profil non configuré
          </p>
          <p className="text-ink/60 text-sm mb-6">
            Votre compte est créé mais n&apos;est encore lié à aucune agence.
            Contactez l&apos;administrateur pour finaliser la configuration.
          </p>
          <SignOutButton />
        </div>
      </main>
    );
  }

  const agencyId = profile.agency_id;

  const { data: agency } = await supabase
    .from("agencies")
    .select("name")
    .eq("id", agencyId)
    .maybeSingle();

  const [{ count: leadsCount }, { count: propertiesCount }, { count: appointmentsCount }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId),
      supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .gte("scheduled_at", new Date().toISOString()),
    ]);

  const agencyName = agency?.name ?? "votre agence";

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader agencyName={agencyName} />

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl text-ink mb-1">
          Bonjour {profile.full_name?.split(" ")[0] ?? ""}
        </h1>
        <p className="text-ink/60 mb-8">Voici l&apos;état de votre agence aujourd&apos;hui.</p>

        <InsightsPanel />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Leads actifs" value={leadsCount ?? 0} href="/dashboard/contacts" />
          <StatCard label="Biens en portefeuille" value={propertiesCount ?? 0} href="/dashboard/biens" />
          <StatCard label="Rendez-vous à venir" value={appointmentsCount ?? 0} href="/dashboard/rendez-vous" />
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="border border-line rounded-lg bg-white p-6 h-full hover:border-clay/50 transition-colors">
      <p className="text-3xl font-display text-ink">{value}</p>
      <p className="text-sm text-ink/60 mt-1">{label}</p>
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
