import { SupabaseClient } from "@supabase/supabase-js";

export type Insights = {
  hotLeads: { id: string; contactId: string; name: string; score: number }[];
  staleContacts: { id: string; name: string }[];
  staleProperties: { id: string; title: string }[];
  upcomingVisitsToConfirm: number;
};

export async function computeInsights(
  supabase: SupabaseClient,
  agencyId: string
): Promise<Insights> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

  const { data: hotLeads } = await supabase
    .from("leads")
    .select("id, ai_score, contacts(id, first_name, last_name)")
    .eq("agency_id", agencyId)
    .gte("ai_score", 70)
    .order("ai_score", { ascending: false })
    .limit(5);

  const { data: qualifiedLeads } = await supabase
    .from("leads")
    .select("contact_id, contacts(id, first_name, last_name)")
    .eq("agency_id", agencyId)
    .not("ai_score", "is", null);

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

  const { data: availableProperties } = await supabase
    .from("properties")
    .select("id, title, type, city")
    .eq("agency_id", agencyId)
    .eq("status", "available");

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

  const { data: upcomingVisits } = await supabase
    .from("appointments")
    .select("id, scheduled_at, contacts(first_name, last_name)")
    .eq("agency_id", agencyId)
    .eq("type", "visit")
    .eq("status", "scheduled")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in48h);

  return {
    hotLeads: (hotLeads ?? []).map((l: any) => ({
      id: l.id,
      contactId: l.contacts?.id,
      name: `${l.contacts?.first_name ?? ""} ${l.contacts?.last_name ?? ""}`.trim() || "Contact sans nom",
      score: Math.round(l.ai_score),
    })),
    staleContacts: staleContacts.slice(0, 5),
    staleProperties: staleProperties.slice(0, 5),
    upcomingVisitsToConfirm: (upcomingVisits ?? []).length,
  };
}
