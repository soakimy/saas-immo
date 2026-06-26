import { requireAgency } from "@/lib/require-agency";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import ContactForm from "@/components/ContactForm";

export default async function NewContactPage() {
  const { supabase, profile } = await requireAgency();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, city")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard/contacts" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux contacts
        </Link>
        <h1 className="font-display text-2xl text-ink mb-8">Ajouter un contact</h1>

        <ContactForm agencyId={profile.agency_id} properties={properties ?? []} />
      </section>
    </main>
  );
}
