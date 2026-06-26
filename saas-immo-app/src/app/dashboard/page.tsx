import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import DashboardHeader from "@/components/DashboardHeader";
import { computeInsights } from "@/lib/compute-insights";

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

  const [{ count: leadsCount }, { count: propertiesCount }, { count: appointmentsCount }, insights] =
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
      computeInsights(supabase, agencyId),
    ]);

  const agencyName = agency?.name ?? "votre agence";
  const hasNothingToShow =
    insights.hotLeads.length === 0 &&
    insights.staleContacts.length === 0 &&
    insights.staleProperties.length === 0 &&
    insights.upcomingVisitsToConfirm === 0;

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader agencyName={agencyName} />

      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl text-ink mb-1">
          Bonjour {profile.full_name?.split(" ")[0] ?? ""}
        </h1>
        <p className="text-ink/60 mb-8">Voici l&apos;état de votre agence aujourd&apos;hui.</p>

        <div className="border border-line rounded-lg bg-white p-6 mb-8 space-y-3">
          {hasNothingToShow ? (
            <>
              <p className="text-ink/60 text-sm">
                Rien d&apos;urgent à signaler aujourd&apos;hui. Continuez à qualifier vos contacts pour des recommandations plus précises.
              </p>
              <Link href="/dashboard/priorites" className="text-sm text-clay hover:underline font-medium">
                Voir le top 5 à contacter aujourd&apos;hui →
              </Link>
            </>
          ) : (
            <>
              {insights.hotLeads.length > 0 && (
                <p className="text-sm text-ink flex items-start gap-2">
                  <span className="text-sage">🔥</span>
                  <span className="flex-1">
                    {insights.hotLeads.length} prospect{insights.hotLeads.length > 1 ? "s" : ""} très chaud
                    {insights.hotLeads.length > 1 ? "s" : ""} :{" "}
                    {insights.hotLeads.map((l, i) => (
                      <span key={l.id}>
                        <Link href={`/dashboard/contacts/${l.contactId}`} className="text-clay hover:underline">
                          {l.name} ({l.score}%)
                        </Link>
                        {i < insights.hotLeads.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </p>
              )}

              {insights.staleContacts.length > 0 && (
                <p className="text-sm text-ink flex items-start gap-2">
                  <span className="text-clay">○</span>
                  <span className="flex-1">
                    {insights.staleContacts.length} relance{insights.staleContacts.length > 1 ? "s" : ""} recommandée
                    {insights.staleContacts.length > 1 ? "s" : ""} :{" "}
                    {insights.staleContacts.map((c, i) => (
                      <span key={c.id}>
                        <Link href={`/dashboard/contacts/${c.id}`} className="text-clay hover:underline">
                          {c.name}
                        </Link>
                        {i < insights.staleContacts.length - 1 ? ", " : ""}
                      </span>
                    ))}{" "}
                    n&apos;ont pas reçu de message depuis 7 jours ou plus.
                  </span>
                </p>
              )}

              {insights.staleProperties.length > 0 && (
                <p className="text-sm text-ink flex items-start gap-2">
                  <span className="text-ink/40">○</span>
                  <span className="flex-1">
                    {insights.staleProperties.map((p, i) => (
                      <span key={p.id}>
                        <Link href={`/dashboard/biens/${p.id}`} className="text-clay hover:underline">
                          {p.title}
                        </Link>
                        {i < insights.staleProperties.length - 1 ? ", " : ""}
                      </span>
                    ))}{" "}
                    sans nouveau prospect depuis 12 jours ou plus.
                  </span>
                </p>
              )}

              {insights.upcomingVisitsToConfirm > 0 && (
                <p className="text-sm text-ink flex items-start gap-2">
                  <span className="text-sage">●</span>
                  <span className="flex-1">
                    {insights.upcomingVisitsToConfirm} visite{insights.upcomingVisitsToConfirm > 1 ? "s" : ""} à confirmer dans les 48 prochaines heures.{" "}
                    <Link href="/dashboard/rendez-vous" className="text-clay hover:underline">
                      Voir →
                    </Link>
                  </span>
                </p>
              )}

              <div className="pt-2 border-t border-line">
                <Link href="/dashboard/priorites" className="text-sm text-clay hover:underline font-medium">
                  Voir le top 5 à contacter aujourd&apos;hui →
                </Link>
              </div>
            </>
          )}
        </div>

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
