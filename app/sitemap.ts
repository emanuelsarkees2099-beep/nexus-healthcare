import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus-health.app'
  const now = new Date()

  const publicRoutes = [
    { url: `${base}/`, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${base}/search`, priority: 0.9, changeFrequency: 'daily' as const },
    { url: `${base}/pathways`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${base}/stories`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${base}/programs`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${base}/outcomes`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${base}/impact`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${base}/chw`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/rights`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${base}/advocacy`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${base}/provider`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${base}/accessibility`, priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  return publicRoutes.map(route => ({
    url: route.url,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
