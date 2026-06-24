import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { rawNotes } = await request.json();
  if (!rawNotes || rawNotes.trim().length < 5) {
    return NextResponse.json(
      { error: "Ajoutez quelques notes avant de demander l'enrichissement." },
      { status: 400 }
    );
  }

  const prompt = `Tu es un assistant pour une agence immobilière. Un agent vient de saisir des notes brutes prises pendant ou après une visite. Transforme-les en compte-rendu structuré.

Notes brutes de l'agent :
"${rawNotes}"

Réponds STRICTEMENT en JSON, sans aucun texte avant/après, sans balises markdown :
{
  "summary": "résumé professionnel en 2-3 phrases de la visite",
  "objections": "objections ou réserves exprimées par le visiteur, en 1-2 phrases. Si les notes n'en mentionnent aucune, écris exactement 'Aucune objection particulière relevée.' plutôt que d'en inventer une",
  "nextSteps": "prochaine action concrète recommandée, en une phrase courte"
}

Reste strictement fidèle aux notes fournies. N'invente aucun détail, aucune objection, aucune information qui n'est pas dans les notes brutes. Si les notes sont trop vagues pour déduire quelque chose, dis-le explicitement plutôt que de combler avec des suppositions.`;

  let raw: string;
  try {
    raw = await generateWithClaude(prompt);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la génération : " + err.message },
      { status: 502 }
    );
  }

  let parsed: { summary: string; objections: string; nextSteps: string };
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Réponse de l'IA illisible, réessayez." },
      { status: 502 }
    );
  }

  return NextResponse.json(parsed);
}
