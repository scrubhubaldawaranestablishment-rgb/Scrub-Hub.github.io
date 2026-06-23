import { createSupabaseContext } from '@/lib/supabase/context'

export async function GET() {
  const { data: ctx, error } = await createSupabaseContext({ auth: 'user' })

  if (error) {
    return Response.json({ message: error.message }, { status: 401 })
  }

  const { data, error: queryError } = await ctx.supabase
    .from('tickets')
    .select('id, ref_code, title, status')
    .limit(10)

  if (queryError) {
    return Response.json({ message: queryError.message }, { status: 500 })
  }

  return Response.json({
    authMode: ctx.authMode,
    tickets: data,
  })
}
