import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import DeleteButton from "@/components/DeleteButton";

const TYPE_LABELS: Record<string, string> = {
  visit: "Visite",
  call: "Appel",
  signing: "Signature",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Prévu",
  confirmed: "Confirmé",
  done: "Terminé",
  canceled: "Annulé",
  no_show: "Absence",
};

export default async function AppointmentsPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, type, status, scheduled_at, duration_minutes, contacts(first_name, last_name), properties(title, type, city)")
    .eq("agency_id", profile.agency_id)
    .order("scheduled_at", { ascending: true });

  const now = new Date();
  const upcoming = appointments?.filter((a) => new Date(a.scheduled_at) >= now) ?? [];
  const past = appointments?.filter((a) => new Date(a.scheduled_at) < now) ?? [];

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

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-ink mb-1">Mes rendez-vous</h1>
            <p className="text-ink/60">
              {upcoming.length} à venir
            </p>
          </div>
          <Link
            href="/dashboard/rendez-vous/nouveau"
            className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors"
          >
            Planifier un rendez-vous
          </Link>
        </div>

        <h2 className="font-display text-lg text-ink mb-3">À venir</h2>
        {upcoming.length === 0 ? (
          <div className="border border-line rounded-lg bg-white p-8 text-center mb-10">
            <p className="text-ink/60 mb-3">Aucun rendez-vous prévu.</p>
            <Link href="/dashboard/rendez-vous/nouveau" className="text-clay font-medium hover:underline">
              Planifier un rendez-vous →
            </Link>
          </div>
        ) : (
          <div className="border border-line rounded-lg bg-white divide-y divide-line mb-10">
            {upcoming.map((appt: any) => (
              <AppointmentRow key={appt.id} appt={appt} />
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="font-display text-lg text-ink mb-3">Passés</h2>
            <div className="border border-line rounded-lg bg-white divide-y divide-line opacity-70">
              {past.map((appt: any) => (
                <AppointmentRow key={appt.id} appt={appt} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function AppointmentRow({ appt }: { appt: any }) {
  const date = new Date(appt.scheduled_at);
  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const contactName = appt.contacts
    ? `${appt.contacts.first_name ?? ""} ${appt.contacts.last_name ?? ""}`.trim() || "Contact sans nom"
    : "Aucun contact";

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="text-center w-16">
          <p className="text-xs text-ink/50 uppercase">{dateLabel}</p>
          <p className="font-display text-lg text-ink">{timeLabel}</p>
        </div>
        <div>
          <p className="font-medium text-ink">
            {TYPE_LABELS[appt.type] ?? appt.type} — {contactName}
          </p>
          <p className="text-sm text-ink/60">
            {appt.properties?.title ||
              (appt.properties ? `${appt.properties.type} — ${appt.properties.city ?? ""}` : "Aucun bien associé")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-sage/10 text-sage whitespace-nowrap">
          {STATUS_LABELS[appt.status] ?? appt.status}
        </span>
        <DeleteButton
          table="appointments"
          id={appt.id}
          redirectTo="/dashboard/rendez-vous"
          label="Annuler"
          confirmMessage="Annuler ce rendez-vous ?"
        />
      </div>
    </div>
  );
}
