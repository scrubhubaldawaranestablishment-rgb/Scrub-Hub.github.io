import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function createSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
