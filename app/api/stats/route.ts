import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
// Service role: this is a server-side aggregate-stats route, never exposed
// to the browser, so it should read as a trusted caller rather than depend
// on submissions/outcomes having anon-permissive SELECT (which they no
// longer do -- both are now admin-only at the RLS layer).
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function GET() {
  try {
    const getSupabaseClient = () => createClient(url, serviceRoleKey)

    // Total submissions
    const { count: total } = await getSupabaseClient()
      .from('submissions')
      .select('*', { count: 'exact', head: true })

    // By type
    const { data: byType } = await getSupabaseClient()
      .from('submissions')
      .select('type')

    const typeCounts: Record<string, number> = {}
    if (byType) {
      byType.forEach(r => {
        typeCounts[r.type] = (typeCounts[r.type] || 0) + 1
      })
    }

    // By status
    const { data: byStatus } = await getSupabaseClient()
      .from('submissions')
      .select('status')

    const statusCounts: Record<string, number> = {}
    if (byStatus) {
      byStatus.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1
      })
    }

    // Users count
    const { count: userCount } = await getSupabaseClient()
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // Recent submissions (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentCount } = await getSupabaseClient()
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    return NextResponse.json({
      total: total ?? 0,
      users: userCount ?? 0,
      recent30Days: recentCount ?? 0,
      byType: typeCounts,
      byStatus: statusCounts,
      // Compound stats
      storiesShared: typeCounts.story ?? 0,
      chwRequests: typeCounts.chw ?? 0,
      legalAid: typeCounts.legal ?? 0,
      advocacy: typeCounts.advocacy ?? 0,
      resolved: statusCounts.resolved ?? 0,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[AXVO] Stats error:', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
