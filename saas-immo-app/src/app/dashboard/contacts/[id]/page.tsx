import { createServerSupabase } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import QualifyContactButton from "@/components/QualifyContactButton";
import EditNotesForm from "@/components/EditNotesForm";
import DraftMessageButton from "@/components/DraftMessageButton";
import DeleteButton from "@/components/DeleteButton";

const TYPE_LABELS: Record<string, string> = {
  lead: "Prospect",
  client: "Client",
  owner: "Propriétaire",
  tenant: "Locataire",
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  qualified: "Qualifié",
  visit_scheduled: "Visite prévue",
  negotiation: "En négociation",
  won: "Gagné",
  lost: "Perdu",
};

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!contact) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, status, ai_score, ai_summary, budget_min, budget_max, properties(id, title, type, city, price)")
    .eq("contact_id", contact.id)
    .order("created_at", { ascending: false });

  // Le score/résumé IA est commun à tous les leads de ce contact (même analyse)
  const aiResult = leads?.find((l: any) => l.ai_score !== null);

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
        <Link href="/dashboard/contacts" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux contacts
        </Link>

        <div className="flex items-center justify-end mb-2">
          <DeleteButton table="contacts" id={contact.id} redirectTo="/dashboard/contacts" />
        </div>

        <div className="bg-white border border-line rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="font-display text-2xl text-ink">
              {contact.first_name} {contact.last_name}
              {!contact.first_name && !contact.last_name && "Sans nom"}
            </h1>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-sage/10 text-sage whitespace-nowrap">
              {TYPE_LABELS[contact.type] ?? contact.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Email" value={contact.email || "—"} />
            <Info label="Téléphone" value={contact.phone || "—"} />
            <Info label="Source" value={contact.source || "—"} />
          </div>

          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-ink/50 text-sm mb-1">Notes</p>
            {contact.notes ? (
              <p className="text-ink text-sm mb-2 whitespace-pre-line">{contact.notes}</p>
            ) : (
              <p className="text-ink/40 text-sm italic mb-2">Aucune note pour l&apos;instant.</p>
            )}
            <EditNotesForm
              contactId={contact.id}
              leadId={leads?.[0]?.id ?? null}
              initialNotes={contact.notes ?? ""}
              initialBudgetMin={leads?.[0]?.budget_min ?? null}
              initialBudgetMax={leads?.[0]?.budget_max ?? null}
            />
          </div>

          {leads && leads.length > 0 && (
            <div className="mt-4 pt-4 border-t border-line">
              <div className="flex items-center justify-between mb-3">
                <p className="text-ink/50 text-sm">Qualification IA</p>
                <QualifyContactButton contactId={contact.id} />
              </div>
              {aiResult ? (
                <div className="flex items-start gap-3">
                  <ScoreBadge score={aiResult.ai_score} />
                  <p className="text-ink text-sm flex-1">{aiResult.ai_summary}</p>
                </div>
              ) : (
                <p className="text-ink/40 text-sm italic">Pas encore qualifié.</p>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-line">
            <p className="text-ink/50 text-sm mb-3">Relance</p>
            <DraftMessageButton contactId={contact.id} />
          </div>

          <div className="mt-4 pt-4 border-t border-line flex items-center justify-between">
            <p className="text-ink/50 text-sm">Rendez-vous</p>
            <Link
              href={`/dashboard/rendez-vous/nouveau?contact_id=${contact.id}`}
              className="text-sm font-medium text-clay hover:underline"
            >
              + Planifier un rendez-vous
            </Link>
          </div>
        </div>

        <h2 className="font-display text-lg text-ink mb-3">Biens associés</h2>

        {!leads || leads.length === 0 ? (
          <div className="border border-line rounded-lg bg-white p-6 text-center">
            <p className="text-ink/60 text-sm">Aucun bien associé à ce contact.</p>
          </div>
        ) : (
          <div className="border border-line rounded-lg bg-white divide-y divide-line">
            {leads.map((lead: any) => (
              <Link
                key={lead.id}
                href={lead.properties ? `/dashboard/biens/${lead.properties.id}` : "#"}
                className="flex items-center justify-between px-6 py-4 hover:bg-paper transition-colors"
              >
                <div>
                  <p className="font-medium text-ink">
                    {lead.properties?.title ||
                      `${lead.properties?.type ?? "Bien"} — ${lead.properties?.city ?? ""}`}
                  </p>
                  <p className="text-sm text-ink/60">
                    {lead.properties?.price
                      ? `${Number(lead.properties.price).toLocaleString("fr-FR")} €`
                      : "Prix non défini"}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-clay/10 text-clay whitespace-nowrap">
                  {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ink/50">{label}</p>
      <p className="text-ink font-medium">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-sage/10 text-sage" : score >= 40 ? "bg-clay/10 text-clay" : "bg-ink/10 text-ink/60";

  return (
    <span className={`text-sm font-display px-2.5 py-1 rounded-full whitespace-nowrap ${color}`}>
      {score}/100
    </span>
  );
}
