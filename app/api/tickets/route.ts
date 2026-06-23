import { withSupabase } from '@supabase/server'

const getTickets = withSupabase({ auth: 'user' }, async (_req, ctx) => {
  const { data, error } = await ctx.supabase
    .from('tickets')
    .select('id, ref_code, title, status')
    .limit(10)

  if (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }

  return Response.json(data)
})

export async function GET(request: Request) {
  return getTickets(request)
}
