import Stripe from "npm:stripe@14.25.0";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { createSupabaseAdminClient } from "../_shared/supabase.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return errorResponse("Stripe webhook secrets are missing.", 500);
  }

  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return errorResponse("Missing Stripe signature.", 400);
    }

    const rawBody = await request.text();
    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    const supabaseAdmin = createSupabaseAdminClient();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (!bookingId) {
        return jsonResponse({ received: true, skipped: "missing booking_id" });
      }

      const customerDetails = session.customer_details;
      const { error } = await supabaseAdmin.rpc("complete_booking_checkout", {
        p_booking_id: bookingId,
        p_checkout_session_id: session.id,
        p_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : "",
        p_customer_id: typeof session.customer === "string" ? session.customer : "",
        p_customer_name: customerDetails?.name || "",
        p_customer_email: customerDetails?.email || "",
        p_customer_phone: customerDetails?.phone || "",
      });

      if (error) {
        console.error(error);
        return errorResponse("Booking could not be marked as paid.", 500);
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "expired",
            expires_at: null,
            updated_by: "stripe_webhook",
          })
          .eq("id", bookingId)
          .eq("status", "pending");
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unexpected webhook error.", 400);
  }
});
