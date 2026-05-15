import { createClient } from "npm:@supabase/supabase-js@2";

export function createSupabaseAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legacyServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const secretKey = secretKeysRaw ? JSON.parse(secretKeysRaw).default : legacyServiceRoleKey;

  if (!url || !secretKey) {
    throw new Error("Supabase admin credentials are missing.");
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
