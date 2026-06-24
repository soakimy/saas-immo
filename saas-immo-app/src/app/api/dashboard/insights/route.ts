import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const agencyId = profile.agency_id;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

  // 1. Prospects très chauds (score >= 70)
  const { data: hotLeads } = await supabase
    .from("leads")
    .select("id, ai_score, contacts(id, first_name, last_name)")
    .eq("agency_id", agencyId)
    .gte("ai_score", 70)
    .order("ai_score", { ascending: false })
    .limit(5);

  // 2. Contacts sans message sortant depuis 7+ jours
  // On récupère d'abord les contacts qualifiés (ayant un score), puis on
  // vérifie pour chacun la date du dernier message envoyé.
  const { data: qualifiedLeads } = await supabase
    .from("leads")
    .select("contact_id, contacts(id, first_name, last_name)")
    .eq("agency_id", agencyId)
    .not("ai_score", "is", null);

  const staleContacts: { id: string; name: string }[] = [];
  const seenContactIds = new Set<string>();

  for (const lead of qualifiedLeads ?? []) {
    const contact = (lead as any).contacts;
    if (!contact || seenContactIds.has(contact.id)) continue;
    seenContactIds.add(contact.id);

    const { data: lastMessage } = await supabase
      .from("messages")
      .select("sent_at")
      .eq("contact_id", contact.id)
      .eq("direction", "outbound")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isStale = !lastMessage || lastMessage.sent_at < sevenDaysAgo;
    if (isStale) {
      staleContacts.push({
        id: contact.id,
        name: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Contact sans nom",
      });
    }
  }

  // 3. Biens sans nouveau lead depuis 12+ jours (parmi les biens disponibles)
  const { data: availableProperties } = await supabase
    .from("properties")
    .select("id, title, type, city")
    .eq("agency_id", agencyId)
    .eq("status", "available");

  const staleProperties: { id: string; title: string }[] = [];

  for (const property of availableProperties ?? []) {
    const { data: recentLead } = await supabase
      .from("leads")
      .select("created_at")
      .eq("property_id", property.id)
      .gte("created_at", twelveDaysAgo)
      .limit(1)
      .maybeSingle();

    if (!recentLead) {
      staleProperties.push({
        id: property.id,
        title: property.title || `${property.type} — ${property.city ?? ""}`,
      });
    }
  }

  // 4. Visites prévues (pas confirmées) dans les 48h
  const { data: upcomingVisits } = await supabase
    .from("appointments")
    .select("id, scheduled_at, contacts(first_name, last_name)")
    .eq("agency_id", agencyId)
    .eq("type", "visit")
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in48h);

  return NextResponse.json({
    hotLeads: (hotLeads ?? []).map((l: any) => ({
      id: l.id,
      contactId: l.contacts?.id,
      name: `${l.contacts?.first_name ?? ""} ${l.contacts?.last_name ?? ""}`.trim() || "Contact sans nom",
      score: Math.round(l.ai_score),
    })),
    staleContacts: staleContacts.slice(0, 5),
    staleProperties: staleProperties.slice(0, 5),
    upcomingVisitsToConfirm: (upcomingVisits ?? []).length,
  });
}
