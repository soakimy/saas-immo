import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "La facturation n'est pas encore configurée." },
      { status: 503 }
    );
  }

  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_id, agencies(id, name, stripe_customer_id)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
  }

  const agency = (profile as any).agencies;
  const priceId = process.env.STRIPE_PRICE_ID_PRO;

  if (!priceId) {
    return NextResponse.json(
      { error: "Le plan Pro n'est pas encore configuré." },
      { status: 503 }
    );
  }

  const origin = request.headers.get("origin") ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/abonnement?success=true`,
    cancel_url: `${origin}/dashboard/abonnement?canceled=true`,
    customer: agency.stripe_customer_id || undefined,
    customer_email: agency.stripe_customer_id ? undefined : user.email,
    client_reference_id: agency.id,
    metadata: { agency_id: agency.id },
  });

  return NextResponse.json({ url: session.url });
}
