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

  // On limite à 5 photos : au-delà, le coût et la taille de la requête
  // augmentent sans bénéfice proportionnel pour la qualité du texte.
  // Les photos sont prises dans l'ordre de "position", donc l'agent garde
  // le contrôle en plaçant les meilleures photos en premier sur la fiche.
  const { data: photos, count: totalPhotosCount } = await supabase
    .from("property_photos")
    .select("storage_path", { count: "exact" })
    .eq("property_id", propertyId)
    .order("position", { ascending: true })
    .limit(5);

  const photosIgnored = (totalPhotosCount ?? 0) - (photos?.length ?? 0);

  const images: { base64: string; mediaType: string }[] = [];
  for (const photo of photos ?? []) {
    try {
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("property-photos")
        .download(photo.storage_path);

      if (downloadError || !fileBlob) continue;

      const arrayBuffer = await fileBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = fileBlob.type || "image/jpeg";

      images.push({ base64, mediaType });
    } catch {
      // Si une photo ne peut pas être téléchargée, on continue sans elle
      // plutôt que de faire échouer toute la génération.
      continue;
    }
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
${images.length > 0 ? "\nDes photos du bien sont fournies en plus de ces informations : appuie-toi sur ce que tu vois (luminosité, état, style, aménagement) pour enrichir la description, sans inventer de détails qui ne se voient pas clairement." : ""}

Écris une description vendeuse mais honnête, 4 à 6 phrases, sans inventer de détails qui ne sont pas donnés ci-dessus ou visibles sur les photos. N'utilise pas de superlatifs excessifs. Réponds uniquement avec le texte de l'annonce, sans titre ni commentaire.`;

  let description: string;
  try {
    description = await generateWithClaude(prompt, images);
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

  return NextResponse.json({ description, photosUsed: photos?.length ?? 0, photosIgnored });
}
