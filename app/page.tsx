import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, ref_code, title, status')
    .limit(5)

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '720px' }}>
      <h1>Supabase Connected</h1>
      <p>
        Project: <strong>nossco-core-ops-staging</strong>
      </p>
      <p>
        URL: <code>{projectUrl}</code>
      </p>

      {error ? (
        <p style={{ color: '#b45309' }}>
          Query error: {error.message}
        </p>
      ) : tickets && tickets.length > 0 ? (
        <>
          <p>Recent tickets:</p>
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                {ticket.ref_code ?? ticket.id}: {ticket.title} ({ticket.status})
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ color: '#64748b' }}>
          Connection works. No tickets returned — sign in first if RLS restricts anonymous reads.
        </p>
      )}
    </main>
  )
}
