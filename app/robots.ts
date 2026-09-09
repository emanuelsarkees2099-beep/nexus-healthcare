import { MetadataRoute } from 'next'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/auth/callback', '/settings/'],
      },
    ],
    // Two sitemaps: the ~30 static routes, and every individual clinic
    // detail page (18,900+ -- previously undiscoverable, see
    // app/sitemap-clinics.xml/route.ts for why this is a big deal).
    sitemap: [`${APP_URL}/sitemap.xml`, `${APP_URL}/sitemap-clinics.xml`],
  }
}
