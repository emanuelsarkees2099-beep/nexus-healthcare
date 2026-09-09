/**
 * AXVO — Clinic pages sitemap
 * GET /sitemap-clinics.xml
 *
 * WHY THIS EXISTS: app/sitemap.ts (the main sitemap) only lists the site's
 * ~30 static routes -- it has never included a single one of the 18,900+
 * individual clinic detail pages at /clinics/[id], each of which is a real,
 * unique, indexable page (name, address, services, affordability info,
 * MedicalClinic JSON-LD already on the page itself). That's the single
 * largest source of potential long-tail search traffic this site has
 * ("free clinic in Phoenix AZ", "sliding scale dental Detroit MI", etc.)
 * and none of it has ever been discoverable by Googlebot via the sitemap.
 *
 * Queries public.clinics directly (see supabase/migrations/20260706_clinics_master.sql
 * for the schema this assumes -- source, source_id, updated_at) rather than
 * the ephemeral clinic_cache table, since clinic_cache only ever contains
 * whatever a live search has happened to cache, not the full seeded set.
 * RLS on this table already allows anon SELECT (it's public clinic data),
 * so the anon key is sufficient -- no service role needed here.
 *
 * 18,900 rows fits comfortably in one sitemap file (Google's limits are
 * 50,000 URLs / 50MB per file), so no sitemap index is needed yet -- if the
 * clinics table grows past ~45k rows, split this into multiple files with
 * Next's generateSitemaps() and reference them all from robots.ts.
 */
import { createClient } from '@supabase/supabase-js'

export const revalidate = 86400 // Regenerate at most once a day

const PAGE_SIZE = 1000 // Supabase/PostgREST's default max rows per request

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const base    = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com').replace(/\/$/, '')

  const urls: string[] = []

  if (url && anonKey) {
    try {
      const supabase = createClient(url, anonKey)
      for (let offset = 0; ; offset += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('clinics')
          .select('source, source_id, updated_at')
          .order('id', { ascending: true })
          .range(offset, offset + PAGE_SIZE - 1)

        if (error) {
          console.error('[sitemap-clinics] query failed:', error.message)
          break
        }
        if (!data || data.length === 0) break

        for (const row of data as { source: string; source_id: string; updated_at: string | null }[]) {
          if (!row.source || !row.source_id) continue
          const loc = `${base}/clinics/${encodeURIComponent(`${row.source}-${row.source_id}`)}`
          const lastmod = row.updated_at ? new Date(row.updated_at).toISOString() : undefined
          urls.push(
            `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.5</priority></url>`
          )
        }

        if (data.length < PAGE_SIZE) break
      }
    } catch (e) {
      console.error('[sitemap-clinics] unexpected error:', e)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
