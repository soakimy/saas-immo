import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { propertyId } = await request.json();
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId manquant." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id, type, transaction_type, city, price, surface_m2, rooms")
    .eq("id", propertyId)
    .maybeSingle();

  if (propError || !property) {
    return NextResponse.json({ error: "Bien introuvable." }, { status: 404 });
  }

  // On récupère tous les contacts de type "lead" ou "client" de l'agence,
  // avec leurs leads existants (budget) pour avoir du contexte de matching.
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, type, notes, leads(budget_min, budget_max, status)")
    .eq("agency_id", profile.agency_id)
    .in("type", ["lead", "client"]);

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const contactsDescription = contacts
    .map((c: any, i: number) => {
      const lead = c.leads?.[0];
      return `Contact ${i + 1} (id: ${c.id}) : ${c.first_name ?? ""} ${c.last_name ?? ""}, type ${c.type}. Budget : ${lead?.budget_min ?? "non précisé"} - ${lead?.budget_max ?? "non précisé"} €. Notes : ${c.notes ?? "aucune"}.`;
    })
    .join("\n");

  const prompt = `Tu es un assistant pour une agence immobilière. Évalue la compatibilité entre CE bien et CHAQUE contact ci-dessous, uniquement à partir des informations factuelles données (budget vs prix, ce que les notes indiquent comme recherche).

Bien : ${property.type} en ${property.transaction_type} à ${property.city ?? "ville non précisée"}, ${property.price ?? "prix non précisé"} €, ${property.surface_m2 ?? "?"} m², ${property.rooms ?? "?"} pièces.

Contacts :
${contactsDescription}

Réponds STRICTEMENT en JSON, sans aucun texte avant/après, sans balises markdown :
{"matches": [{"contact_id": "...", "score": un entier entre 0 et 100, "reason": "raison courte en 8 mots maximum"}]}

Règles importantes :
- Base le score uniquement sur des éléments factuels (budget compatible avec le prix, ville/type mentionnés dans les notes). Ne sur-interprète pas des notes vagues.
- Si un contact n'a aucune information utile pour juger la compatibilité, donne un score bas (20-35) plutôt qu'un score inventé.
- N'inclus que les contacts avec un score de 40 ou plus dans la réponse, pour ne montrer que les correspondances pertinentes.
- Trie par score décroissant.`;

  let raw: string;
  try {
    raw = await generateWithClaude(prompt);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de l'analyse : " + err.message },
      { status: 502 }
    );
  }

  let parsed: { matches: { contact_id: string; score: number; reason: string }[] };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Réponse de l'IA illisible, réessayez." },
      { status: 502 }
    );
  }

  // On enrichit avec les noms des contacts pour l'affichage
  const contactsById = new Map(contacts.map((c) => [c.id, c]));
  const enrichedMatches = parsed.matches
    .map((m) => {
      const contact = contactsById.get(m.contact_id) as any;
      if (!contact) return null;
      return {
        contactId: m.contact_id,
        name: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Contact sans nom",
        score: Math.round(m.score),
        reason: m.reason,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ matches: enrichedMatches });
}
