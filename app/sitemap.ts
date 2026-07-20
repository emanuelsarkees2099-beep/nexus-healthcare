import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nexus.health'
  const now  = new Date()

  const routes: Array<{
    url: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }> = [
    /* Core — highest priority */
    { url: `${base}/`,              priority: 1.0,  changeFrequency: 'weekly'  },
    { url: `${base}/search`,        priority: 0.95, changeFrequency: 'daily'   },
    { url: `${base}/clinics`,       priority: 0.95, changeFrequency: 'daily'   }, // #43: was 404
    { url: `${base}/crisis`,        priority: 0.95, changeFrequency: 'weekly'  },
    { url: `${base}/triage`,        priority: 0.90, changeFrequency: 'weekly'  },
    { url: `${base}/programs`,      priority: 0.90, changeFrequency: 'weekly'  },
    { url: `${base}/eligibility`,   priority: 0.90, changeFrequency: 'weekly'  },

    /* Navigation pages */
    { url: `${base}/pathways`,      priority: 0.85, changeFrequency: 'weekly'  },
    { url: `${base}/telehealth`,    priority: 0.85, changeFrequency: 'weekly'  },
    { url: `${base}/medications`,   priority: 0.85, changeFrequency: 'weekly'  },

    /* Community & content */
    { url: `${base}/stories`,       priority: 0.80, changeFrequency: 'daily'   },
    { url: `${base}/kids`,          priority: 0.75, changeFrequency: 'monthly' },
    { url: `${base}/editorial`,     priority: 0.75, changeFrequency: 'weekly'  },
    { url: `${base}/advocacy`,      priority: 0.70, changeFrequency: 'monthly' },
    { url: `${base}/chw`,           priority: 0.70, changeFrequency: 'monthly' },

    /* Tools & features */
    { url: `${base}/passport`,      priority: 0.70, changeFrequency: 'monthly' },
    { url: `${base}/calendar`,      priority: 0.70, changeFrequency: 'monthly' },
    { url: `${base}/rights`,        priority: 0.70, changeFrequency: 'monthly' },

    /* Impact & data */
    { url: `${base}/impact`,        priority: 0.65, changeFrequency: 'weekly'  },
    { url: `${base}/outcomes`,      priority: 0.60, changeFrequency: 'weekly'  },
    { url: `${base}/equity`,        priority: 0.60, changeFrequency: 'monthly' },
    { url: `${base}/methodology`,   priority: 0.55, changeFrequency: 'monthly' },

    /* Verify */
    { url: `${base}/verify`,        priority: 0.60, changeFrequency: 'monthly' },

    /* Auth (low crawl priority) */
    { url: `${base}/login`,         priority: 0.30, changeFrequency: 'yearly'  },
    { url: `${base}/signup`,        priority: 0.35, changeFrequency: 'yearly'  },

    /* Informational */
    { url: `${base}/about`,         priority: 0.60, changeFrequency: 'monthly' },
    { url: `${base}/accessibility`, priority: 0.50, changeFrequency: 'monthly' },
    { url: `${base}/privacy`,       priority: 0.40, changeFrequency: 'yearly'  },
    { url: `${base}/terms`,         priority: 0.40, changeFrequency: 'yearly'  },
  ]

  return routes.map(r => ({
    url: r.url,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
