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

  const { data: properties } = await supabase
    .from("properties")
    .select("id, type, price, status, created_at, leads(id)")
    .eq("agency_id", agencyId);

  if (!properties || properties.length < 3) {
    return NextResponse.json({
      insights: [],
      tooFewData: true,
    });
  }

  const insights: string[] = [];

  // 1. Biens par tranche de prix vs nombre moyen de leads
  const withPrice = properties.filter((p) => p.price !== null);
  if (withPrice.length >= 3) {
    const sorted = [...withPrice].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    const median = sorted[Math.floor(sorted.length / 2)].price ?? 0;

    const expensive = withPrice.filter((p) => (p.price ?? 0) > median);
    const cheap = withPrice.filter((p) => (p.price ?? 0) <= median);

    const avgLeadsExpensive =
      expensive.reduce((sum, p) => sum + ((p as any).leads?.length ?? 0), 0) / (expensive.length || 1);
    const avgLeadsCheap =
      cheap.reduce((sum, p) => sum + ((p as any).leads?.length ?? 0), 0) / (cheap.length || 1);

    if (avgLeadsCheap > avgLeadsExpensive * 1.3) {
      insights.push(
        `Les biens au-dessus de ${Math.round(median).toLocaleString("fr-FR")} € génèrent en moyenne moins de demandes que les biens moins chers de votre portefeuille.`
      );
    } else if (avgLeadsExpensive > avgLeadsCheap * 1.3) {
      insights.push(
        `Les biens au-dessus de ${Math.round(median).toLocaleString("fr-FR")} € génèrent en moyenne plus de demandes que les biens moins chers de votre portefeuille.`
      );
    }
  }

  // 2. Comparaison par type de bien (le type avec le plus de leads en moyenne)
  const typeGroups = new Map<string, { count: number; totalLeads: number }>();
  for (const p of properties) {
    const entry = typeGroups.get(p.type) ?? { count: 0, totalLeads: 0 };
    entry.count += 1;
    entry.totalLeads += (p as any).leads?.length ?? 0;
    typeGroups.set(p.type, entry);
  }

  const typeAverages = Array.from(typeGroups.entries())
    .filter(([, v]) => v.count >= 2) // au moins 2 biens du type pour que la moyenne ait un sens
    .map(([type, v]) => ({ type, avg: v.totalLeads / v.count }));

  if (typeAverages.length >= 2) {
    typeAverages.sort((a, b) => b.avg - a.avg);
    const best = typeAverages[0];
    const worst = typeAverages[typeAverages.length - 1];
    if (best.avg > worst.avg * 1.5 && best.avg > 0) {
      insights.push(
        `Les biens de type "${best.type}" reçoivent en moyenne plus de demandes que les biens de type "${worst.type}" dans votre portefeuille actuel.`
      );
    }
  }

  // 3. Biens disponibles sans aucune demande depuis leur création
  const availableNoLeads = properties.filter(
    (p) => p.status === "available" && ((p as any).leads?.length ?? 0) === 0
  );
  if (availableNoLeads.length > 0) {
    insights.push(
      `${availableNoLeads.length} bien${availableNoLeads.length > 1 ? "s" : ""} disponible${availableNoLeads.length > 1 ? "s" : ""} n'${availableNoLeads.length > 1 ? "ont" : "a"} reçu aucune demande depuis leur ajout.`
    );
  }

  return NextResponse.json({ insights, tooFewData: false });
}
