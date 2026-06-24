import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Le webhook doit utiliser une clé admin (service_role), car cet
// appel vient de Stripe, pas d'un utilisateur connecté à l'app —
// il n'y a donc pas de session pour passer le RLS normalement.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Signature invalide : " + err.message },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const agencyId = session.metadata?.agency_id;

      if (agencyId) {
        await supabaseAdmin
          .from("agencies")
          .update({
            subscription_plan: "pro",
            subscription_status: "active",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq("id", agencyId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      await supabaseAdmin
        .from("agencies")
        .update({
          subscription_status: subscription.status === "active" ? "active" : "past_due",
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      await supabaseAdmin
        .from("agencies")
        .update({
          subscription_plan: "trial",
          subscription_status: "canceled",
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      // Les autres événements ne sont pas traités pour l'instant.
      break;
  }

  return NextResponse.json({ received: true });
}
