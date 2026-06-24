import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { contactId, subject, body } = await request.json();
  if (!contactId || !subject || !body) {
    return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("id, email, first_name, last_name, agency_id")
    .eq("id", contactId)
    .maybeSingle();

  if (contactError || !contact) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  if (!contact.email) {
    return NextResponse.json(
      { error: "Ce contact n'a pas d'adresse email enregistrée." },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agencies(name)")
    .eq("id", user.id)
    .maybeSingle();

  const agencyName = (profile as any)?.agencies?.name ?? "Votre agence";

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "L'envoi d'emails n'est pas encore configuré pour cette agence." },
      { status: 503 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error: sendError } = await resend.emails.send({
    from: `${agencyName} <onboarding@resend.dev>`,
    to: [contact.email],
    subject,
    text: body,
  });

  if (sendError) {
    return NextResponse.json(
      { error: "Échec de l'envoi : " + sendError.message },
      { status: 502 }
    );
  }

  // On enregistre le message comme réellement envoyé
  await supabase.from("messages").insert({
    agency_id: contact.agency_id,
    contact_id: contactId,
    channel: "email",
    direction: "outbound",
    subject,
    body,
    ai_generated: true,
    status: "sent",
  });

  return NextResponse.json({ success: true });
}
