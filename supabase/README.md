Stripe test-mode setup for staging

1. Run this SQL in the staging Supabase project:
   - `C:\Users\nskil\Downloads\SM-cars2\site-only\admin\supabase-booking-payments.sql`

2. Set Edge Function secrets in the staging Supabase project:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. Deploy functions from `C:\Users\nskil\Downloads\SM-cars2\site-only`:
   - `npx supabase login`
   - `npx supabase link --project-ref dztkclhqoqiefqotrdtn`
   - `npx supabase secrets set --env-file supabase/.env`
   - `npx supabase functions deploy create-stripe-checkout --no-verify-jwt`
   - `npx supabase functions deploy stripe-webhook --no-verify-jwt`

4. In Stripe test mode create a webhook endpoint:
   - `https://dztkclhqoqiefqotrdtn.supabase.co/functions/v1/stripe-webhook`
   - events:
     - `checkout.session.completed`
     - `checkout.session.expired`

5. Save the webhook signing secret from Stripe into Supabase as:
   - `STRIPE_WEBHOOK_SECRET`

Notes

- Checkout is configured to charge the full amount.
- Checkout timeout is 30 minutes because Stripe Checkout cannot expire earlier than 30 minutes.
- Customer data is taken from the completed Stripe Checkout Session:
  - `customer_details.email`
  - `customer_details.name`
  - `customer_details.phone` when phone collection is enabled
