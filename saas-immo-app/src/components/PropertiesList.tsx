"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Property = {
  id: string;
  title: string | null;
  type: string;
  transaction_type: string;
  status: string;
  price: number | null;
  city: string | null;
  surface_m2: number | null;
  photoUrl: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  under_offer: "Sous offre",
  sold: "Vendu",
  rented: "Loué",
  archived: "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-sage/10 text-sage",
  under_offer: "bg-clay/10 text-clay",
  sold: "bg-ink/10 text-ink/60",
  rented: "bg-ink/10 text-ink/60",
  archived: "bg-ink/5 text-ink/40",
};

export default function PropertiesList({ properties }: { properties: Property[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return properties;
    const q = query.toLowerCase();
    return properties.filter((p) => {
      const title = p.title?.toLowerCase() ?? "";
      return (
        title.includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q)
      );
    });
  }, [properties, query]);

  return (
    <div>
      <div className="relative mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par titre, ville ou type..."
          className="w-full rounded-md border border-line bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-clay/40 focus:border-clay"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {query && (
        <p className="text-sm text-ink/50 mb-3">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="border border-line rounded-lg bg-white p-8 text-center">
          <p className="text-ink/60 text-sm">Aucun bien ne correspond à cette recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((property) => (
            <Link
              key={property.id}
              href={`/dashboard/biens/${property.id}`}
              className="block border border-line rounded-lg bg-white overflow-hidden hover:border-clay/50 transition-colors"
            >
              <div className="aspect-[16/9] bg-line">
                {property.photoUrl ? (
                  <img src={property.photoUrl} alt="" className="w-full h-full object-cover" />
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
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[property.status] ?? STATUS_COLORS.available}`}
                  >
                    {STATUS_LABELS[property.status] ?? property.status}
                  </span>
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
          ))}
        </div>
      )}
    </div>
  );
}
