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

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id, type, first_name, last_name, source, notes")
    .eq("id", contactId)
    .maybeSingle();

  if (contactError || !contact) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  // On récupère le ou les leads existants pour ce contact, avec le bien associé
  const { data: leads } = await supabase
    .from("leads")
    .select("id, budget_min, budget_max, properties(type, transaction_type, city, price)")
    .eq("contact_id", contactId);

  if (!leads || leads.length === 0) {
    return NextResponse.json(
      { error: "Ce contact n'a aucun bien associé à qualifier." },
      { status: 400 }
    );
  }

  const leadsDescription = leads
    .map((lead: any, i: number) => {
      const p = lead.properties;
      return `Bien ${i + 1} : ${p?.type ?? "non précisé"} en ${p?.transaction_type ?? "non précisé"} à ${p?.city ?? "ville non précisée"}, prix ${p?.price ? p.price + " €" : "non précisé"}. Budget du contact : ${lead.budget_min ?? "non précisé"} - ${lead.budget_max ?? "non précisé"} €.`;
    })
    .join("\n");

  const prompt = `Tu es un assistant pour une agence immobilière. Analyse ce contact et donne une qualification.

Type de contact : ${contact.type}
Source : ${contact.source ?? "non précisée"}
Notes de l'agent : ${contact.notes ?? "aucune note"}

Biens qui l'intéressent :
${leadsDescription}

Réponds STRICTEMENT au format JSON suivant, sans aucun texte avant ou après, sans balises markdown :
{
  "score": un nombre entre 0 et 100 représentant la probabilité que ce contact aboutisse à une transaction,
  "summary": un résumé ULTRA-COURT en style télégraphique, façon fiche, par exemple "Acheteur sérieux. Budget 350-400k€. Recherche 3 chambres. Financement non précisé. Priorité moyenne." — pas de phrases complètes avec sujet/verbe, juste les faits clés séparés par des points,
  "actions": une liste de 1 à 3 actions concrètes et courtes (4-6 mots max chacune), par exemple ["Appeler aujourd'hui", "Organiser une visite", "Envoyer le bien X"]. Si rien d'urgent ne se dégage des informations disponibles, propose une seule action neutre comme "Relancer pour en savoir plus" plutôt que d'inventer une urgence.
}

Base le score et les actions uniquement sur les informations données ci-dessus. Si peu d'informations sont disponibles, donne un score prudent autour de 40-50 et des actions prudentes (récolter plus d'informations), plutôt que d'inventer un niveau d'urgence ou de certitude qui n'est pas justifié par les données.`;

  let raw: string;
  try {
    raw = await generateWithClaude(prompt);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la génération : " + err.message },
      { status: 502 }
    );
  }

  let parsed: { score: number; summary: string; actions: string[] };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Réponse de l'IA illisible, réessayez." },
      { status: 502 }
    );
  }

  // On met à jour tous les leads de ce contact avec le même score/résumé/actions
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      ai_score: parsed.score,
      ai_summary: parsed.summary,
      ai_recommended_actions: parsed.actions,
      ai_last_qualified_at: new Date().toISOString(),
    })
    .eq("contact_id", contactId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    await supabase.from("ai_actions_log").insert({
      agency_id: profile.agency_id,
      action_type: "lead_qualification",
      related_table: "contacts",
      related_id: contactId,
      output_summary: parsed.summary,
    });
  }

  return NextResponse.json(parsed);
}
