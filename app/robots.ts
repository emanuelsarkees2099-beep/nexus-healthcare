import { MetadataRoute } from 'next'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/auth/callback', '/settings/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
