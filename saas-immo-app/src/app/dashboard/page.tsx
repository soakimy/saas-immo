import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, agency_id, agencies(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md border border-line rounded-lg bg-white p-8">
          <p className="font-display text-xl text-ink mb-2">
            Profil non configuré
          </p>
          <p className="text-ink/60 text-sm">
            Votre compte est créé mais n&apos;est encore lié à aucune agence.
            Contactez l&apos;administrateur pour finaliser la configuration.
          </p>
        </div>
      </main>
    );
  }

  const agencyId = profile.agency_id;

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

  const agencyName = (profile as any)?.agencies?.name ?? "votre agence";

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="font-display text-xl text-ink">Bureau</p>
            <p className="text-sm text-ink/50">{agencyName}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl text-ink mb-1">
          Bonjour {profile.full_name?.split(" ")[0] ?? ""}
        </h1>
        <p className="text-ink/60 mb-8">Voici l&apos;état de votre agence aujourd&apos;hui.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Leads actifs" value={leadsCount ?? 0} />
          <StatCard label="Biens en portefeuille" value={propertiesCount ?? 0} />
          <StatCard label="Rendez-vous à venir" value={appointmentsCount ?? 0} />
        </div>

        <div className="mt-10 border border-line rounded-lg bg-white p-8 text-center">
          <p className="text-ink/60">
            C&apos;est ici que viendront vos contacts, vos biens et votre
            assistant IA, étape par étape.
          </p>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line rounded-lg bg-white p-6">
      <p className="text-3xl font-display text-ink">{value}</p>
      <p className="text-sm text-ink/60 mt-1">{label}</p>
    </div>
  );
}
