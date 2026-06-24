import { createServerSupabase } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import GenerateDescriptionButton from "@/components/GenerateDescriptionButton";
import DeleteButton from "@/components/DeleteButton";
import PropertyPhotos from "@/components/PropertyPhotos";
import MatchingPanel from "@/components/MatchingPanel";

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!property) notFound();

  const { data: photos } = await supabase
    .from("property_photos")
    .select("id, storage_path, position")
    .eq("property_id", params.id)
    .order("position", { ascending: true });

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
        <Link href="/dashboard/biens" className="text-sm text-ink/60 hover:text-ink mb-4 inline-block">
          ← Retour aux biens
        </Link>

        <div className="flex items-center justify-end gap-4 mb-2">
          <Link
            href={`/dashboard/biens/${property.id}/modifier`}
            className="text-sm font-medium text-ink/60 hover:text-ink"
          >
            Modifier
          </Link>
          <DeleteButton table="properties" id={property.id} redirectTo="/dashboard/biens" />
        </div>

        <div className="bg-white border border-line rounded-lg p-8">
          <h1 className="font-display text-2xl text-ink mb-1">
            {property.title || `${property.type} — ${property.city || ""}`}
          </h1>
          <p className="text-ink/60 mb-6">
            {property.type} · {property.transaction_type}
          </p>

          <div className="mb-6">
            <PropertyPhotos propertyId={property.id} initialPhotos={photos ?? []} />
          </div>

          <p className="font-display text-3xl text-clay mb-6">
            {property.price
              ? `${Number(property.price).toLocaleString("fr-FR")} €`
              : "Prix non défini"}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Surface" value={property.surface_m2 ? `${property.surface_m2} m²` : "—"} />
            <Info label="Pièces" value={property.rooms ?? "—"} />
            <Info label="Adresse" value={property.address || "—"} />
            <Info label="Ville" value={property.city || "—"} />
            <Info label="Code postal" value={property.postal_code || "—"} />
            <Info label="Statut" value={property.status} />
          </div>

          <div className="mt-6 pt-6 border-t border-line">
            <div className="flex items-center justify-between mb-3">
              <p className="text-ink/50 text-sm">Description de l&apos;annonce</p>
              <GenerateDescriptionButton
                propertyId={property.id}
                hasDescription={!!property.description}
              />
            </div>
            {property.description ? (
              <p className="text-ink text-sm whitespace-pre-line">{property.description}</p>
            ) : (
              <p className="text-ink/40 text-sm italic">
                Aucune description pour l&apos;instant.
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-line">
            <p className="text-ink/50 text-sm mb-3">Prospects compatibles</p>
            <MatchingPanel
              apiUrl="/api/properties/match-contacts"
              bodyKey="propertyId"
              bodyValue={property.id}
              linkPrefix="/dashboard/contacts"
              emptyLabel="Aucun prospect compatible identifié pour l'instant."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-ink/50">{label}</p>
      <p className="text-ink font-medium">{value}</p>
    </div>
  );
}
