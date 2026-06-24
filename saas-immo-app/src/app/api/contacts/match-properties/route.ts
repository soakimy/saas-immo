import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { contactId } = await request.json();
  if (!contactId) {
    return NextResponse.json({ error: "contactId manquant." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, type, notes, leads(budget_min, budget_max)")
    .eq("id", contactId)
    .maybeSingle();

  if (contactError || !contact) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, transaction_type, city, price, surface_m2, rooms, status")
    .eq("agency_id", profile.agency_id)
    .eq("status", "available");

  if (!properties || properties.length === 0) {
    return NextResponse.json({ matches: [] });
  }

  const lead = (contact as any).leads?.[0];

  const propertiesDescription = properties
    .map(
      (p, i) =>
        `Bien ${i + 1} (id: ${p.id}) : ${p.type} en ${p.transaction_type} à ${p.city ?? "ville non précisée"}, ${p.price ?? "prix non précisé"} €, ${p.surface_m2 ?? "?"} m², ${p.rooms ?? "?"} pièces.`
    )
    .join("\n");

  const prompt = `Tu es un assistant pour une agence immobilière. Évalue la compatibilité entre CE contact et CHAQUE bien disponible ci-dessous, uniquement à partir d'informations factuelles.

Contact : type ${contact.type}. Budget : ${lead?.budget_min ?? "non précisé"} - ${lead?.budget_max ?? "non précisé"} €. Notes : ${contact.notes ?? "aucune"}.

Biens disponibles :
${propertiesDescription}

Réponds STRICTEMENT en JSON, sans aucun texte avant/après, sans balises markdown :
{"matches": [{"property_id": "...", "score": un entier entre 0 et 100, "reason": "raison courte en 8 mots maximum"}]}

Règles importantes :
- Base le score uniquement sur des éléments factuels (budget compatible avec le prix, ce que les notes indiquent comme recherche).
- Si le contact n'a aucune information utile (pas de budget, pas de notes), donne des scores bas (20-35) plutôt que d'inventer une affinité.
- N'inclus que les biens avec un score de 40 ou plus.
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

  let parsed: { matches: { property_id: string; score: number; reason: string }[] };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Réponse de l'IA illisible, réessayez." },
      { status: 502 }
    );
  }

  const propertiesById = new Map(properties.map((p) => [p.id, p]));
  const enrichedMatches = parsed.matches
    .map((m) => {
      const property = propertiesById.get(m.property_id);
      if (!property) return null;
      return {
        propertyId: m.property_id,
        title: property.title || `${property.type} — ${property.city ?? ""}`,
        score: Math.round(m.score),
        reason: m.reason,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ matches: enrichedMatches });
}
