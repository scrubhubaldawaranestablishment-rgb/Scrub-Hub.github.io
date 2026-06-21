import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, ref_code, title, status')
    .limit(5)

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <main className="mx-auto max-w-2xl p-8 font-sans">
      <h1 className="text-2xl font-semibold">Supabase Connected</h1>
      <p className="mt-2">
        Project: <strong>nossco-core-ops-staging</strong>
      </p>
      <p className="mt-1">
        URL: <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{projectUrl}</code>
      </p>
      <p className="mt-4">
        <a href="/auth/login" className="text-primary underline">
          Sign in
        </a>{' '}
        to access protected routes and ticket data.
      </p>

      {error ? (
        <p className="mt-4 text-amber-700">Query error: {error.message}</p>
      ) : tickets && tickets.length > 0 ? (
        <>
          <p className="mt-4">Recent tickets:</p>
          <ul className="mt-2 list-disc pl-5">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                {ticket.ref_code ?? ticket.id}: {ticket.title} ({ticket.status})
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 text-muted-foreground">
          Connection works. No tickets returned — sign in first if RLS restricts anonymous reads.
        </p>
      )}
    </main>
  )
}
