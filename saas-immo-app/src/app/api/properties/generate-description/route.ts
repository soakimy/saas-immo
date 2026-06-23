import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { generateWithClaude } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { propertyId } = await request.json();
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId manquant." }, { status: 400 });
  }

  // RLS garantit que cette lecture ne renverra rien si le bien
  // n'appartient pas à l'agence de l'utilisateur connecté.
  const { data: property, error: fetchError } = await supabase
    .from("properties")
    .select("id, type, transaction_type, surface_m2, rooms, bedrooms, city, price, energy_class")
    .eq("id", propertyId)
    .maybeSingle();

  if (fetchError || !property) {
    return NextResponse.json({ error: "Bien introuvable." }, { status: 404 });
  }

  const prompt = `Tu rédiges une annonce immobilière professionnelle en français, pour une agence.
Voici les caractéristiques du bien :
- Type : ${property.type}
- Transaction : ${property.transaction_type}
- Ville : ${property.city ?? "non précisée"}
- Surface : ${property.surface_m2 ? property.surface_m2 + " m²" : "non précisée"}
- Pièces : ${property.rooms ?? "non précisé"}
- Chambres : ${property.bedrooms ?? "non précisé"}
- Prix : ${property.price ? property.price + " €" : "non précisé"}
- Classe énergie : ${property.energy_class ?? "non précisée"}

Écris une description vendeuse mais honnête, 4 à 6 phrases, sans inventer de détails qui ne sont pas donnés ci-dessus. N'utilise pas de superlatifs excessifs. Réponds uniquement avec le texte de l'annonce, sans titre ni commentaire.`;

  let description: string;
  try {
    description = await generateWithClaude(prompt);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la génération : " + err.message },
      { status: 502 }
    );
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update({ description, ai_generated_description: true })
    .eq("id", propertyId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Traçabilité : on garde une trace de cette action IA
  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    await supabase.from("ai_actions_log").insert({
      agency_id: profile.agency_id,
      action_type: "description_generation",
      related_table: "properties",
      related_id: propertyId,
      output_summary: description.slice(0, 200),
    });
  }

  return NextResponse.json({ description });
}
