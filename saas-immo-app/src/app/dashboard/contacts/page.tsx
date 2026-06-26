import { requireAgency } from "@/lib/require-agency";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import ContactsList from "@/components/ContactsList";

export default async function ContactsPage() {
  const { supabase, profile } = await requireAgency();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, type, email, phone")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl text-ink mb-1">Mes contacts</h1>
            <p className="text-ink/60">
              {contacts?.length ?? 0} contact{(contacts?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/contacts/relance-groupee"
              className="text-center border border-line bg-white text-ink rounded-md px-5 py-2.5 font-medium hover:border-clay/50 transition-colors"
            >
              Relance groupée
            </Link>
            <Link
              href="/dashboard/contacts/nouveau"
              className="text-center bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors"
            >
              Ajouter un contact
            </Link>
          </div>
        </div>

        {!contacts || contacts.length === 0 ? (
          <div className="border border-line rounded-lg bg-white p-12 text-center">
            <p className="text-ink/60 mb-4">
              Aucun contact pour l&apos;instant. Ajoutez votre premier prospect ou client.
            </p>
            <Link
              href="/dashboard/contacts/nouveau"
              className="text-clay font-medium hover:underline"
            >
              Ajouter un contact →
            </Link>
          </div>
        ) : (
          <ContactsList contacts={contacts} />
        )}
      </section>
    </main>
  );
}
