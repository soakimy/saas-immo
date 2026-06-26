import { requireAgency } from "@/lib/require-agency";
import { notFound } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import PropertyForm from "@/components/PropertyForm";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, profile } = await requireAgency();

  const { data: property } = await supabase
    .from("properties")
    .select("id, type, transaction_type, title, price, surface_m2, rooms, address, city, postal_code")
    .eq("id", params.id)
    .maybeSingle();

  if (!property) notFound();

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-2xl mx-auto px-6 py-10">
        <Link href={`/dashboard/biens/${property.id}`} className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour au bien
        </Link>
        <h1 className="font-display text-2xl text-ink mb-8">Modifier le bien</h1>

        <PropertyForm agencyId={profile.agency_id} existingProperty={property} />
      </section>
    </main>
  );
}
