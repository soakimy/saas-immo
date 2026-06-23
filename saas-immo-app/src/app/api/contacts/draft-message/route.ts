import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

const LEAD_STATUS_CONTEXT: Record<string, string> = {
  new: "C'est un premier contact, le but est de se présenter et de proposer une prochaine étape (visite ou appel).",
  qualified: "Le contact est qualifié, le but est de proposer une visite ou un rendez-vous concret.",
  visit_scheduled: "Une visite est déjà prévue, le but est de confirmer les détails et de mettre en confiance.",
  negotiation: "Le dossier est en négociation, le but est de faire avancer la discussion avec tact.",
  won: "La transaction est conclue, le but est de remercier et de proposer la suite des démarches.",
  lost: "Le dossier n'a pas abouti, le but est de rester courtois et de laisser la porte ouverte pour le futur.",
};

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
    .select("id, first_name, last_name, type, notes")
    .eq("id", contactId)
    .maybeSingle();

  if (contactError || !contact) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("status, ai_summary, properties(type, transaction_type, city, price)")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false })
    .limit(1);

  const lead = leads?.[0] as any;
  const property = lead?.properties;
  const statusContext = lead?.status
    ? LEAD_STATUS_CONTEXT[lead.status] ?? "Adapte le ton à la situation."
    : "Aucun bien spécifique associé, reste générique mais chaleureux.";

  const prompt = `Tu rédiges un brouillon d'email pour un agent immobilier à envoyer à un contact.

Contact : ${contact.first_name ?? ""} ${contact.last_name ?? ""} (${contact.type})
Notes de l'agent sur ce contact : ${contact.notes ?? "aucune"}
${property ? `Bien concerné : ${property.type} en ${property.transaction_type} à ${property.city ?? "ville non précisée"}, ${property.price ? property.price + " €" : "prix non précisé"}.` : ""}
${lead?.ai_summary ? `Analyse de la situation : ${lead.ai_summary}` : ""}
Contexte : ${statusContext}

Rédige un email court (5-8 phrases), professionnel mais chaleureux, en français, signé "L'équipe" à la fin (pas de nom d'agent précis). Réponds STRICTEMENT au format suivant, sans rien d'autre avant ou après :

SUJET: [le sujet de l'email]
CORPS: [le corps de l'email]`;

  let raw: string;
  try {
    raw = await generateWithClaude(prompt);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la génération : " + err.message },
      { status: 502 }
    );
  }

  const subjectMatch = raw.match(/SUJET:\s*(.+)/);
  const bodyMatch = raw.match(/CORPS:\s*([\s\S]+)/);

  const subject = subjectMatch?.[1]?.trim() ?? "Suivi de votre projet";
  const body = bodyMatch?.[1]?.trim() ?? raw.trim();

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    // On enregistre le brouillon comme message sortant, marqué IA, statut "draft"
    await supabase.from("messages").insert({
      agency_id: profile.agency_id,
      contact_id: contactId,
      channel: "email",
      direction: "outbound",
      subject,
      body,
      ai_generated: true,
      status: "draft",
    });

    await supabase.from("ai_actions_log").insert({
      agency_id: profile.agency_id,
      action_type: "email_draft",
      related_table: "contacts",
      related_id: contactId,
      output_summary: subject,
    });
  }

  return NextResponse.json({ subject, body });
}
