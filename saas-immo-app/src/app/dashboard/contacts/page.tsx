import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

const TYPE_LABELS: Record<string, string> = {
  lead: "Prospect",
  client: "Client",
  owner: "Propriétaire",
  tenant: "Locataire",
};

export default async function ContactsPage() {
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
    .select("id, first_name, last_name, type, email, phone")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

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
            <h1 className="font-display text-2xl text-ink mb-1">Mes contacts</h1>
            <p className="text-ink/60">
              {contacts?.length ?? 0} contact{(contacts?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/dashboard/contacts/nouveau"
            className="bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors"
          >
            Ajouter un contact
          </Link>
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
          <div className="border border-line rounded-lg bg-white divide-y divide-line">
            {contacts.map((contact) => (
              <Link
                key={contact.id}
                href={`/dashboard/contacts/${contact.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-paper transition-colors"
              >
                <div>
                  <p className="font-medium text-ink">
                    {contact.first_name} {contact.last_name}
                    {!contact.first_name && !contact.last_name && "Sans nom"}
                  </p>
                  <p className="text-sm text-ink/60">
                    {contact.email || contact.phone || "Aucun contact renseigné"}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-sage/10 text-sage whitespace-nowrap">
                  {TYPE_LABELS[contact.type] ?? contact.type}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
