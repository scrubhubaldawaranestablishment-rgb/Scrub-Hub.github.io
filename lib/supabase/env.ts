import type { SupabaseEnv } from '@supabase/server'

/**
 * Maps server-side SUPABASE_* env vars, falling back to NEXT_PUBLIC_* values
 * used by the browser client.
 */
export function resolveSupabaseEnv(): Partial<SupabaseEnv> {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const secretKey = process.env.SUPABASE_SECRET_KEY

  return {
    url: url ?? undefined,
    publishableKeys: publishableKey ? { default: publishableKey } : {},
    secretKeys: secretKey ? { default: secretKey } : {},
  }
}

export function getSupabaseJwksUrl(): string | undefined {
  if (process.env.SUPABASE_JWKS_URL) {
    return process.env.SUPABASE_JWKS_URL
  }

  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL

  return url ? `${url}/auth/v1/.well-known/jwks.json` : undefined
}
