import { SupabaseClient } from "@supabase/supabase-js";

export type RiskSignal = { type: string; label: string; daysAgo: number };
export type Priority = {
  id: string;
  name: string;
  priorityScore: number;
  signals: RiskSignal[];
};

export async function computePriorities(
  supabase: SupabaseClient,
  agencyId: string
): Promise<Priority[]> {
  const now = new Date();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, type, created_at, leads(ai_score, status)")
    .eq("agency_id", agencyId)
    .in("type", ["lead", "client"]);

  if (!contacts || contacts.length === 0) return [];

  const [{ data: allMessages }, { data: allPastVisits }, { data: allReports }] = await Promise.all([
    supabase
      .from("messages")
      .select("contact_id, sent_at")
      .eq("agency_id", agencyId)
      .eq("direction", "outbound"),
    supabase
      .from("appointments")
      .select("contact_id, scheduled_at")
      .eq("agency_id", agencyId)
      .eq("type", "visit")
      .lt("scheduled_at", now.toISOString()),
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

  const lastPastVisitByContact = new Map<string, string>();
  for (const v of allPastVisits ?? []) {
    if (!v.contact_id) continue;
    const current = lastPastVisitByContact.get(v.contact_id);
    if (!current || v.scheduled_at > current) lastPastVisitByContact.set(v.contact_id, v.scheduled_at);
  }

  const reportsByContact = new Map<string, string[]>();
  for (const r of allReports ?? []) {
    if (!r.contact_id) continue;
    const list = reportsByContact.get(r.contact_id) ?? [];
    list.push(r.created_at);
    reportsByContact.set(r.contact_id, list);
  }

  const results: Priority[] = [];

  for (const contact of contacts) {
    const leads = (contact as any).leads as { ai_score: number | null; status: string }[];
    const isLost = leads?.every((l) => l.status === "lost" || l.status === "won");
    if (isLost && leads?.length > 0) continue;

    const signals: RiskSignal[] = [];
    let priorityScore = 0;

    const lastMessageDate = lastMessageByContact.get(contact.id);
    const daysSinceLastMessage = lastMessageDate
      ? Math.floor((now.getTime() - new Date(lastMessageDate).getTime()) / 86400000)
      : Math.floor((now.getTime() - new Date(contact.created_at).getTime()) / 86400000);

    if (daysSinceLastMessage >= 14) {
      signals.push({
        type: "no_response",
        label: `N'a pas reçu de relance depuis ${daysSinceLastMessage} jours`,
        daysAgo: daysSinceLastMessage,
      });
      priorityScore += 30;
    } else if (daysSinceLastMessage >= 7) {
      signals.push({
        type: "no_response",
        label: `Dernière relance il y a ${daysSinceLastMessage} jours`,
        daysAgo: daysSinceLastMessage,
      });
      priorityScore += 15;
    }

    const pastVisitDate = lastPastVisitByContact.get(contact.id);
    if (pastVisitDate) {
      const reports = reportsByContact.get(contact.id) ?? [];
      const hasReportAfterVisit = reports.some((r) => r >= pastVisitDate);
      const hasMessageAfterVisit = !!lastMessageDate && lastMessageDate > pastVisitDate;

      if (!hasReportAfterVisit && !hasMessageAfterVisit) {
        const daysSinceVisit = Math.floor((now.getTime() - new Date(pastVisitDate).getTime()) / 86400000);
        signals.push({
          type: "no_followup",
          label: "Visite effectuée mais aucun suivi enregistré",
          daysAgo: daysSinceVisit,
        });
        priorityScore += 40;
      }
    }

    const scores = (leads ?? []).map((l) => l.ai_score ?? 0);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    if (bestScore >= 70) {
      signals.push({
        type: "hot_lead",
        label: `Score de qualification élevé (${Math.round(bestScore)}%)`,
        daysAgo: 0,
      });
      priorityScore += 25;
    }

    if (signals.length > 0) {
      results.push({
        id: contact.id,
        name: `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Contact sans nom",
        priorityScore,
        signals,
      });
    }
  }

  results.sort((a, b) => b.priorityScore - a.priorityScore);
  return results.slice(0, 5);
}
