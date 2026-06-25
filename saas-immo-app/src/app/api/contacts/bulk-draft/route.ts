import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

const LEAD_STATUS_CONTEXT: Record<string, string> = {
  new: "C'est un premier contact, le but est de se présenter et de proposer une prochaine étape.",
  qualified: "Le contact est qualifié, le but est de proposer une visite ou un rendez-vous concret.",
  visit_scheduled: "Une visite est déjà prévue, le but est de confirmer les détails.",
  negotiation: "Le dossier est en négociation, le but est de faire avancer la discussion avec tact.",
  won: "La transaction est conclue, le but est de remercier.",
  lost: "Le dossier n'a pas abouti, le but est de rester courtois.",
};

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { contactIds } = await request.json();
  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    return NextResponse.json({ error: "Aucun contact sélectionné." }, { status: 400 });
  }

  if (contactIds.length > 15) {
    return NextResponse.json(
      { error: "Maximum 15 contacts à la fois pour garder un temps de génération raisonnable." },
      { status: 400 }
    );
  }

  const drafts: { contactId: string; name: string; email: string | null; subject?: string; body?: string; error?: string }[] = [];

  for (const contactId of contactIds) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, email, type, notes")
      .eq("id", contactId)
      .maybeSingle();

    if (!contact) {
      drafts.push({ contactId, name: "Contact introuvable", email: null, error: "Introuvable" });
      continue;
    }

    const name = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Contact sans nom";

    if (!contact.email) {
      drafts.push({ contactId, name, email: null, error: "Pas d'adresse email" });
      continue;
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

Contact : ${name} (${contact.type})
Notes de l'agent : ${contact.notes ?? "aucune"}
${property ? `Bien concerné : ${property.type} en ${property.transaction_type} à ${property.city ?? "ville non précisée"}, ${property.price ? property.price + " €" : "prix non précisé"}.` : ""}
${lead?.ai_summary ? `Analyse de la situation : ${lead.ai_summary}` : ""}
Contexte : ${statusContext}

Rédige un email court (4-6 phrases), professionnel mais chaleureux, en français, signé "L'équipe". Réponds STRICTEMENT au format suivant, sans rien d'autre :

SUJET: [sujet]
CORPS: [corps]`;

    try {
      const raw = await generateWithClaude(prompt);
      const subjectMatch = raw.match(/SUJET:\s*(.+)/);
      const bodyMatch = raw.match(/CORPS:\s*([\s\S]+)/);

      drafts.push({
        contactId,
        name,
        email: contact.email,
        subject: subjectMatch?.[1]?.trim() ?? "Suivi de votre projet",
        body: bodyMatch?.[1]?.trim() ?? raw.trim(),
      });
    } catch (err: any) {
      drafts.push({ contactId, name, email: contact.email, error: "Échec de la génération" });
    }
  }

  return NextResponse.json({ drafts });
}
