"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  type: string;
  email: string | null;
  phone: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  lead: "Prospect",
  client: "Client",
  owner: "Propriétaire",
  tenant: "Locataire",
};

export default function ContactsList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return contacts;
    const q = query.toLowerCase();
    return contacts.filter((c) => {
      const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`.toLowerCase();
      return (
        fullName.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    });
  }, [contacts, query]);

  return (
    <div>
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, email ou téléphone..."
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
          <p className="text-ink/60 text-sm">Aucun contact ne correspond à cette recherche.</p>
        </div>
      ) : (
        <div className="border border-line rounded-lg bg-white divide-y divide-line">
          {filtered.map((contact) => (
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
    </div>
  );
}
