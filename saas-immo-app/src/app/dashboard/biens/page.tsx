import { createServerSupabase } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import PortfolioAnalysis from "@/components/PortfolioAnalysis";

function publicPhotoUrl(supabase: ReturnType<typeof createServerSupabase>, path: string) {
  return supabase.storage.from("property-photos").getPublicUrl(path).data.publicUrl;
}

export default async function PropertiesPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard");

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, transaction_type, status, price, city, surface_m2, property_photos(storage_path, position)")
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.map((property: any) => {
              const firstPhoto = property.property_photos?.sort(
                (a: any, b: any) => a.position - b.position
              )[0];

              return (
                <Link
                  key={property.id}
                  href={`/dashboard/biens/${property.id}`}
                  className="block border border-line rounded-lg bg-white overflow-hidden hover:border-clay/50 transition-colors"
                >
                  <div className="aspect-[16/9] bg-line">
                    {firstPhoto ? (
                      <img
                        src={publicPhotoUrl(supabase, firstPhoto.storage_path)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">
                        Aucune photo
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-display text-lg text-ink">
                        {property.title || `${property.type} — ${property.city || "sans ville"}`}
                      </p>
                      <StatusBadge status={property.status} />
                    </div>
                    <p className="text-sm text-ink/60 mb-3">
                      {property.type} · {property.transaction_type}
                      {property.surface_m2 ? ` · ${property.surface_m2} m²` : ""}
                    </p>
                    <p className="font-display text-xl text-clay">
                      {property.price
                        ? `${Number(property.price).toLocaleString("fr-FR")} €`
                        : "Prix non défini"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    available: "Disponible",
    under_offer: "Sous offre",
    sold: "Vendu",
    rented: "Loué",
    archived: "Archivé",
  };

  const colors: Record<string, string> = {
    available: "bg-sage/10 text-sage",
    under_offer: "bg-clay/10 text-clay",
    sold: "bg-ink/10 text-ink/60",
    rented: "bg-ink/10 text-ink/60",
    archived: "bg-ink/5 text-ink/40",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${colors[status] ?? colors.available}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
