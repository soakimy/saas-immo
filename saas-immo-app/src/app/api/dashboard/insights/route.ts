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

  // 2. Contacts sans suivi (message ou compte-rendu) depuis 7+ jours
  const { data: qualifiedLeads } = await supabase
    .from("leads")
    .select("contact_id, contacts(id, first_name, last_name)")
    .eq("agency_id", agencyId)
    .not("ai_score", "is", null);

  // On charge en une seule fois tous les messages et comptes-rendus
  // de l'agence, plutôt qu'une requête par contact (qui ne passerait
  // pas à l'échelle avec 50-100 contacts réels).
  const [{ data: allMessages }, { data: allReports }] = await Promise.all([
    supabase
      .from("messages")
      .select("contact_id, sent_at")
      .eq("agency_id", agencyId)
      .eq("direction", "outbound"),
    supabase
      .from("documents")
      .select("contact_id, created_at")
      .eq("agency_id", agencyId)
      .eq("type", "cr_visite"),
  ]);

  const lastMessageByContact = new Map<string, string>();
  for (const m of allMessages ?? []) {
    if (!m.contact_id) continue;
    const current = lastMessageByContact.get(m.contact_id);
    if (!current || m.sent_at > current) lastMessageByContact.set(m.contact_id, m.sent_at);
  }

  const lastReportByContact = new Map<string, string>();
  for (const r of allReports ?? []) {
    if (!r.contact_id) continue;
    const current = lastReportByContact.get(r.contact_id);
    if (!current || r.created_at > current) lastReportByContact.set(r.contact_id, r.created_at);
  }

  const staleContacts: { id: string; name: string }[] = [];
  const seenContactIds = new Set<string>();

  for (const lead of qualifiedLeads ?? []) {
    const contact = (lead as any).contacts;
    if (!contact || seenContactIds.has(contact.id)) continue;
    seenContactIds.add(contact.id);

    const lastMessageDate = lastMessageByContact.get(contact.id);
    const lastReportDate = lastReportByContact.get(contact.id);

    const hasRecentFollowUp =
      (!!lastMessageDate && lastMessageDate >= sevenDaysAgo) ||
      (!!lastReportDate && lastReportDate >= sevenDaysAgo);

    if (!hasRecentFollowUp) {
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

  // Même principe : tous les leads récents de l'agence en une requête,
  // plutôt qu'une requête par bien.
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("property_id, created_at")
    .eq("agency_id", agencyId)
    .gte("created_at", twelveDaysAgo);

  const propertyIdsWithRecentLead = new Set(
    (recentLeads ?? []).map((l) => l.property_id).filter(Boolean)
  );

  const staleProperties = (availableProperties ?? [])
    .filter((property) => !propertyIdsWithRecentLead.has(property.id))
    .map((property) => ({
      id: property.id,
      title: property.title || `${property.type} — ${property.city ?? ""}`,
    }));

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
