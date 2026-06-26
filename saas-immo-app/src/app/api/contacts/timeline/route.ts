import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

type TimelineEvent = {
  type: "created" | "message" | "appointment" | "qualification";
  date: string;
  title: string;
  detail?: string;
};

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const contactId = request.nextUrl.searchParams.get("contactId");
  if (!contactId) {
    return NextResponse.json({ error: "contactId manquant." }, { status: 400 });
  }

  const { data: contact } = await supabase
    .from("contacts")
    .select("id, created_at, type")
    .eq("id", contactId)
    .maybeSingle();

  if (!contact) {
    return NextResponse.json({ error: "Contact introuvable." }, { status: 404 });
  }

  const events: TimelineEvent[] = [
    {
      type: "created",
      date: contact.created_at,
      title: "Contact créé",
      detail: contact.type === "lead" ? "Ajouté comme prospect" : "Ajouté comme " + contact.type,
    },
  ];

  const { data: messages } = await supabase
    .from("messages")
    .select("channel, direction, subject, sent_at, status")
    .eq("contact_id", contactId);

  for (const m of messages ?? []) {
    events.push({
      type: "message",
      date: m.sent_at,
      title:
        m.direction === "outbound"
          ? `Email envoyé${m.status === "draft" ? " (brouillon, non envoyé)" : ""}`
          : "Email reçu",
      detail: m.subject ?? undefined,
    });
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("type, scheduled_at, status")
    .eq("contact_id", contactId);

  const APPT_LABELS: Record<string, string> = { visit: "Visite", call: "Appel", signing: "Signature" };
  const STATUS_LABELS: Record<string, string> = {
    scheduled: "prévu",
    confirmed: "confirmé",
    done: "terminé",
    canceled: "annulé",
    no_show: "absence",
  };

  for (const a of appointments ?? []) {
    const isPast = new Date(a.scheduled_at) < new Date();
    const stillPending = a.status === "scheduled" || a.status === "confirmed";

    const displayStatus =
      isPast && stillPending ? "passé (non confirmé comme terminé)" : STATUS_LABELS[a.status] ?? a.status;

    events.push({
      type: "appointment",
      date: a.scheduled_at,
      title: `${APPT_LABELS[a.type] ?? a.type} ${displayStatus}`,
    });
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("ai_last_qualified_at, ai_score, ai_summary")
    .eq("contact_id", contactId)
    .not("ai_last_qualified_at", "is", null);

  for (const l of leads ?? []) {
    events.push({
      type: "qualification",
      date: l.ai_last_qualified_at,
      title: `Qualifié par l'IA`,
      detail: l.ai_summary ?? undefined,
    });
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ events });
}
