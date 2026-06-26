// Petit client minimal pour appeler l'API Anthropic depuis le serveur.
// On évite d'installer le SDK officiel pour garder le projet simple :
// un simple appel fetch suffit pour ce qu'on fait ici.

type ImageInput = { base64: string; mediaType: string };

export async function generateWithClaude(
  prompt: string,
  images: ImageInput[] = []
): Promise<string> {
  const content: any[] = images.map((img) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: img.mediaType,
      data: img.base64,
    },
  }));

  content.push({ type: "text", text: prompt });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erreur API Claude (${response.status}) : ${errorBody}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: any) => block.type === "text");

  if (!textBlock) {
    throw new Error("Réponse de Claude vide ou inattendue.");
  }

  return textBlock.text as string;
}
