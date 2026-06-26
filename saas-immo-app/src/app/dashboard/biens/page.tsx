import { requireAgency } from "@/lib/require-agency";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import PortfolioAnalysis from "@/components/PortfolioAnalysis";
import PropertiesList from "@/components/PropertiesList";

export default async function PropertiesPage() {
  const { supabase, profile } = await requireAgency();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, transaction_type, status, price, city, surface_m2, property_photos(storage_path, position)")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

  const propertiesWithPhotoUrl = (properties ?? []).map((p: any) => {
    const firstPhoto = p.property_photos?.sort((a: any, b: any) => a.position - b.position)[0];
    return {
      id: p.id,
      title: p.title,
      type: p.type,
      transaction_type: p.transaction_type,
      status: p.status,
      price: p.price,
      city: p.city,
      surface_m2: p.surface_m2,
      photoUrl: firstPhoto
        ? supabase.storage.from("property-photos").getPublicUrl(firstPhoto.storage_path).data.publicUrl
        : null,
    };
  });

  return (
    <main className="min-h-screen bg-paper">
      <DashboardHeader />

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl text-ink mb-1">Mes biens</h1>
            <p className="text-ink/60">
              {properties?.length ?? 0} bien{(properties?.length ?? 0) > 1 ? "s" : ""} en portefeuille
            </p>
          </div>
          <Link
            href="/dashboard/biens/nouveau"
            className="text-center bg-ink text-paper rounded-md px-5 py-2.5 font-medium hover:bg-ink/90 transition-colors"
          >
            Ajouter un bien
          </Link>
        </div>

        <div className="border border-line rounded-lg bg-white p-6 mb-8">
          <p className="text-ink/50 text-sm mb-3">Analyse de portefeuille</p>
          <PortfolioAnalysis />
        </div>

        {!properties || properties.length === 0 ? (
          <div className="border border-line rounded-lg bg-white p-12 text-center">
            <p className="text-ink/60 mb-4">
              Aucun bien pour l&apos;instant. Ajoutez le premier de votre portefeuille.
            </p>
            <Link
              href="/dashboard/biens/nouveau"
              className="text-clay font-medium hover:underline"
            >
              Ajouter un bien →
            </Link>
          </div>
        ) : (
          <PropertiesList properties={propertiesWithPhotoUrl} />
        )}
      </section>
    </main>
  );
}
