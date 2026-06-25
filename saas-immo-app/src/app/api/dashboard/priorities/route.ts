import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

type RiskSignal = { type: string; label: string; daysAgo: number };

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

  // On part des contacts actifs (lead ou client), pas perdus/gagnés
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, type, created_at, leads(ai_score, status)")
    .eq("agency_id", agencyId)
    .in("type", ["lead", "client"]);

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ priorities: [] });
  }

  const results: {
    id: string;
    name: string;
    priorityScore: number;
    signals: RiskSignal[];
  }[] = [];

  for (const contact of contacts) {
    const leads = (contact as any).leads as { ai_score: number | null; status: string }[];
    const isLost = leads?.every((l) => l.status === "lost" || l.status === "won");
    if (isLost && leads?.length > 0) continue; // on ignore les dossiers clos

    const signals: RiskSignal[] = [];
    let priorityScore = 0;

    // Signal 1 : dernier message sortant
    const { data: lastMessage } = await supabase
      .from("messages")
      .select("sent_at")
      .eq("contact_id", contact.id)
      .eq("direction", "outbound")
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const daysSinceLastMessage = lastMessage
      ? Math.floor((now.getTime() - new Date(lastMessage.sent_at).getTime()) / 86400000)
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

    // Signal 2 : visite passée sans suivi après
    const { data: pastVisit } = await supabase
      .from("appointments")
      .select("scheduled_at")
      .eq("contact_id", contact.id)
      .eq("type", "visit")
      .lt("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pastVisit) {
      const visitDate = new Date(pastVisit.scheduled_at);
      const hasFollowUpAfterVisit =
        lastMessage && new Date(lastMessage.sent_at) > visitDate;

      if (!hasFollowUpAfterVisit) {
        const daysSinceVisit = Math.floor((now.getTime() - visitDate.getTime()) / 86400000);
        signals.push({
          type: "no_followup",
          label: "Visite effectuée mais aucun suivi enregistré",
          daysAgo: daysSinceVisit,
        });
        priorityScore += 40;
      }
    }

    // Signal 3 : score de qualification élevé (priorité business, pas un risque)
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

  return NextResponse.json({ priorities: results.slice(0, 5) });
}
