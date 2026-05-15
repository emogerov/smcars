import Stripe from "npm:stripe@14.25.0";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { createSupabaseAdminClient } from "../_shared/supabase.ts";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const STRIPE_CURRENCY = "eur";
const CHECKOUT_TIMEOUT_MINUTES = 30;
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

type CmsVehicle = {
  id: string;
  mainCategory?: string;
  carClass?: string;
  brand?: string;
  model?: string;
  prices?: Array<{ label?: string; value?: string }>;
};

type CmsContent = {
  vehicles?: CmsVehicle[];
  seasonalRules?: Array<{ key?: string; surchargePerDay?: number; periods?: string[] }>;
};

type CheckoutRequest = {
  vehicleId?: string;
  vehicleName?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  currency?: string;
  locale?: string;
  returnUrl?: string;
};

function parsePriceNumber(value: string | null | undefined) {
  const normalized = String(value || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIsoDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, offset: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + offset);
  return next;
}

function getInclusiveDayCount(startDate: string, endDate: string) {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end || end < start) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000) + 1;
}

function getVehiclePricingBucket(vehicle: CmsVehicle) {
  if (vehicle.mainCategory === "truck") return "truck";
  if (vehicle.mainCategory === "car") return vehicle.carClass || "";
  return "";
}

function parseSeasonalPeriod(period: string) {
  const match = String(period || "")
    .trim()
    .match(/^(\d{2})-(\d{2})\s*->\s*(\d{2})-(\d{2})$/);
  if (!match) return null;
  return {
    startDay: Number(match[1]),
    startMonth: Number(match[2]),
    endDay: Number(match[3]),
    endMonth: Number(match[4]),
  };
}

function isDateInSeasonalPeriod(date: Date, period: string) {
  const parsed = parseSeasonalPeriod(period);
  if (!parsed) return false;

  const monthDay = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
  const start = parsed.startMonth * 100 + parsed.startDay;
  const end = parsed.endMonth * 100 + parsed.endDay;

  if (start <= end) return monthDay >= start && monthDay <= end;
  return monthDay >= start || monthDay <= end;
}

function countSeasonalDaysInRange(content: CmsContent, vehicle: CmsVehicle, startDate: string, endDate: string) {
  const bucket = getVehiclePricingBucket(vehicle);
  if (!bucket) return 0;
  const rule = (content.seasonalRules || []).find((entry) => entry?.key === bucket);
  if (!rule?.periods?.length || !rule.surchargePerDay) return 0;

  const start = parseIsoDate(startDate);
  const days = getInclusiveDayCount(startDate, endDate);
  if (!start || !days) return 0;

  let count = 0;
  for (let index = 0; index < days; index += 1) {
    const current = addDays(start, index);
    if (rule.periods.some((period) => isDateInSeasonalPeriod(current, period))) {
      count += 1;
    }
  }
  return count;
}

function getSeasonalSurcharge(content: CmsContent, vehicle: CmsVehicle, startDate: string) {
  const bucket = getVehiclePricingBucket(vehicle);
  if (!bucket) return 0;
  const rule = (content.seasonalRules || []).find((entry) => entry?.key === bucket);
  if (!rule?.surchargePerDay) return 0;
  const start = parseIsoDate(startDate);
  if (!start) return 0;
  return rule.periods?.some((period) => isDateInSeasonalPeriod(start, period)) ? Number(rule.surchargePerDay) : 0;
}

function getVehicleDisplayName(vehicle: CmsVehicle) {
  return [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim() || vehicle.id;
}

function buildBookingQuote(content: CmsContent, vehicle: CmsVehicle, startDate: string, endDate: string) {
  const days = getInclusiveDayCount(startDate, endDate);
  if (!days) return null;

  const seasonalDays = countSeasonalDaysInRange(content, vehicle, startDate, endDate);
  const surchargePerDay = getSeasonalSurcharge(content, vehicle, startDate);

  if (days > 30) {
    return null;
  }

  if (days === 1) {
    const base = parsePriceNumber(vehicle.prices?.[0]?.value);
    if (!Number.isFinite(base)) return null;
    return {
      days,
      total: base + surchargePerDay * seasonalDays,
    };
  }

  let tierIndex = 1;
  if (days >= 7 && days <= 14) tierIndex = 2;
  else if (days >= 15 && days <= 30) tierIndex = 3;

  const daily = parsePriceNumber(vehicle.prices?.[tierIndex]?.value);
  if (!Number.isFinite(daily)) return null;
  return {
    days,
    total: daily * days + surchargePerDay * seasonalDays,
  };
}

function sanitizeReturnUrl(input: string | undefined) {
  const fallback = "http://127.0.0.1:5501/site-only/index.html";
  if (!input) return fallback;

  try {
    const url = new URL(input);
    const allowedHosts = new Set(["127.0.0.1", "localhost", "smcars.bg", "www.smcars.bg"]);
    if (!allowedHosts.has(url.hostname)) return fallback;
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    return url.toString();
  } catch {
    return fallback;
  }
}

async function fetchPublishedContent(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const apikey = request.headers.get("apikey");
  if (!supabaseUrl || !apikey) {
    throw new Error("Published CMS content could not be loaded.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/cms_snapshots?stage=eq.published&select=content`, {
    headers: {
      apikey,
      Authorization: `Bearer ${apikey}`,
    },
  });

  if (!response.ok) {
    throw new Error("Published CMS content could not be loaded.");
  }

  const rows = (await response.json()) as Array<{ content?: CmsContent }>;
  return rows[0]?.content || null;
}

function buildReturnUrl(baseUrl: string, status: "success" | "cancel") {
  const url = new URL(baseUrl);
  url.searchParams.set("checkout", status);
  if (status === "success") {
    url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  }
  return url.toString();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return errorResponse("Method not allowed.", 405);
  }

  if (!STRIPE_SECRET_KEY) {
    return errorResponse("Stripe secret key is missing.", 500);
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const body = (await request.json()) as CheckoutRequest;
    const vehicleId = String(body.vehicleId || "").trim();
    const startDate = String(body.startDate || "").trim();
    const endDate = String(body.endDate || "").trim();

    if (!vehicleId || !startDate || !endDate) {
      return errorResponse("Missing booking data.");
    }

    const content = await fetchPublishedContent(request);
    if (!content) {
      return errorResponse("Published CMS content could not be loaded.", 500);
    }
    const vehicle = (content.vehicles || []).find((entry) => entry?.id === vehicleId);
    if (!vehicle) {
      return errorResponse("Vehicle not found.", 404);
    }

    const quote = buildBookingQuote(content, vehicle, startDate, endDate);
    if (!quote?.total || !Number.isFinite(quote.total)) {
      return errorResponse("This vehicle cannot be paid online for the selected period.", 400);
    }

    const {
      data: pendingBooking,
      error: pendingError,
    } = await supabaseAdmin.rpc("create_pending_booking", {
      p_vehicle_id: vehicleId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_total_amount: quote.total,
      p_currency: "EUR",
      p_timeout_minutes: CHECKOUT_TIMEOUT_MINUTES,
    });

    if (pendingError || !pendingBooking) {
      const message = /BOOKING_CONFLICT/i.test(pendingError?.message || "") ? "Selected dates are no longer available." : "Pending booking could not be created.";
      return errorResponse(message, /BOOKING_CONFLICT/i.test(pendingError?.message || "") ? 409 : 500);
    }

    const returnUrl = sanitizeReturnUrl(body.returnUrl);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: buildReturnUrl(returnUrl, "success"),
      cancel_url: buildReturnUrl(returnUrl, "cancel"),
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      locale: body.locale === "en" ? "en" : "auto",
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_TIMEOUT_MINUTES * 60,
      client_reference_id: pendingBooking.id,
      metadata: {
        booking_id: pendingBooking.id,
        vehicle_id: vehicleId,
        vehicle_name: getVehicleDisplayName(vehicle),
        start_date: startDate,
        end_date: endDate,
        days: String(quote.days),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: Math.round(quote.total * 100),
            product_data: {
              name: `${getVehicleDisplayName(vehicle)} (${startDate} - ${endDate})`,
              description: `Rental booking for ${quote.days} day(s)`,
            },
          },
        },
      ],
    });

    const { error: attachError } = await supabaseAdmin.rpc("attach_booking_checkout_session", {
      p_booking_id: pendingBooking.id,
      p_checkout_session_id: session.id,
    });

    if (attachError) {
      await supabaseAdmin
        .from("bookings")
        .update({
          status: "expired",
          expires_at: null,
          updated_by: "stripe_checkout",
        })
        .eq("id", pendingBooking.id);
      return errorResponse("Checkout session could not be linked to the booking.", 500);
    }

    return jsonResponse({
      checkoutSessionId: session.id,
      bookingId: pendingBooking.id,
      url: session.url,
      amount: quote.total,
      currency: "EUR",
    });
  } catch (error) {
    console.error(error);
    return errorResponse(error instanceof Error ? error.message : "Unexpected checkout error.", 500);
  }
});
