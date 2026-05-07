/**
 * JsonLd — Structured Data injection component
 *
 * Usage:
 *   <JsonLd schema={webAppSchema} />
 *   <JsonLd schema={faqSchema} />
 *   <JsonLd schema={[webAppSchema, orgSchema]} />
 *
 * Renders a <script type="application/ld+json"> tag in <head>
 * via Next.js Script or direct injection (both work in App Router).
 *
 * 5.9 implementation — supports:
 *   - WebApplication (root layout)
 *   - Organization (root layout)
 *   - FAQPage (eligibility, programs)
 *   - BreadcrumbList (inner pages)
 *   - MedicalWebPage (crisis, triage)
 */

type JsonLdSchema = Record<string, unknown> | Record<string, unknown>[]

interface JsonLdProps {
  schema: JsonLdSchema
  /** Optional id for deduplication when multiple schemas render */
  id?: string
}

export default function JsonLd({ schema, id }: JsonLdProps) {
  const json = JSON.stringify(Array.isArray(schema) ? schema : schema)
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   Pre-built schema factories — import these in page/layout files
   ─────────────────────────────────────────────────────────────────────────── */

const BASE_URL  = 'https://nexus.health'
const LOGO_URL  = `${BASE_URL}/icons/icon-512.png`

/** Root WebApplication schema — used in app/layout.tsx */
export const WEB_APP_SCHEMA = {
  '@context':        'https://schema.org',
  '@type':           'WebApplication',
  name:              'NEXUS',
  url:               BASE_URL,
  logo:              LOGO_URL,
  applicationCategory: 'HealthApplication',
  operatingSystem:   'All',
  offers: {
    '@type':   'Offer',
    price:     '0',
    priceCurrency: 'USD',
  },
  description:
    'NEXUS finds free clinics, sliding-scale care, and hidden programs for the 30 million uninsured Americans who deserve better.',
  featureList: [
    'Free clinic search by location',
    'Healthcare eligibility calculator',
    'Mental health crisis resources',
    'Telehealth provider directory',
    'Health equity resources',
    'Community health worker directory',
    'Patient rights guide',
    'Health passport (record storage)',
  ],
  screenshot: `${BASE_URL}/og-default.png`,
  inLanguage: ['en', 'es', 'zh', 'vi', 'ko', 'fr', 'ht', 'ar'],
}

/** Organization schema — used in app/layout.tsx */
export const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:       'NEXUS',
  url:        BASE_URL,
  logo:       LOGO_URL,
  description:
    'NEXUS is a free platform connecting uninsured Americans to free clinics, healthcare programs, and community support.',
  foundingDate: '2024',
  sameAs: [
    'https://twitter.com/nexushealth',
  ],
  contactPoint: {
    '@type':       'ContactPoint',
    contactType:   'customer support',
    availableLanguage: 'English',
  },
}

/** FAQ schema factory — pass an array of Q&A pairs */
export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context':   'https://schema.org',
    '@type':      'FAQPage',
    mainEntity:   items.map(({ question, answer }) => ({
      '@type':          'Question',
      name:             question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:    answer,
      },
    })),
  }
}

/** Breadcrumb schema factory */
export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context':    'https://schema.org',
    '@type':       'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      name:       c.name,
      item:       c.url,
    })),
  }
}

/** MedicalWebPage schema for crisis/triage pages */
export function medicalPageSchema(name: string, description: string, url: string) {
  return {
    '@context':    'https://schema.org',
    '@type':       'MedicalWebPage',
    name,
    description,
    url,
    audience: {
      '@type':     'Patient',
    },
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Eligibility page FAQ content
   ─────────────────────────────────────────────────────────────────────────── */
export const ELIGIBILITY_FAQ_SCHEMA = faqSchema([
  {
    question: 'How do I know if I qualify for free healthcare?',
    answer:
      'Your eligibility depends on your income (relative to the Federal Poverty Level), household size, age, state of residence, and immigration status. The NEXUS eligibility wizard checks all of these factors and shows you which programs you likely qualify for in under 2 minutes.',
  },
  {
    question: 'What is Medicaid and do I qualify?',
    answer:
      'Medicaid is a joint federal-state program that provides free or low-cost health coverage. In states that expanded Medicaid, adults earning up to 138% of the Federal Poverty Level (about $20,120/year for a single person in 2024) qualify. In non-expansion states, eligibility is typically limited to parents, pregnant women, children, elderly, and people with disabilities.',
  },
  {
    question: 'Can I get free healthcare if I am undocumented?',
    answer:
      'Yes. Federally Qualified Health Centers (FQHCs) and free clinics serve everyone regardless of immigration status. Emergency Medicaid covers emergency medical conditions in all states. Some states provide full Medicaid to undocumented residents. NEXUS shows you all options available in your state.',
  },
  {
    question: 'What is the Federal Poverty Level (FPL)?',
    answer:
      'The Federal Poverty Level is a measure of income issued annually by the Department of Health and Human Services. In 2024, 100% FPL is $15,060 for a single person. Many healthcare programs use FPL percentages (e.g., "138% FPL" or "200% FPL") to determine eligibility.',
  },
  {
    question: 'How long does it take to apply for Medicaid?',
    answer:
      'You can apply for Medicaid online at your state\'s Medicaid agency website, and most applications take 10–20 minutes. States are required to process applications within 45 days (or 90 days for disability-based applications). NEXUS can show you the direct link to apply in your state.',
  },
  {
    question: 'What if I don\'t qualify for any programs?',
    answer:
      'Even if you don\'t qualify for Medicaid or CHIP, you likely have options: Federally Qualified Health Centers (FQHCs) offer care on a sliding-scale fee based on your income. Free clinics serve patients at no cost. Hill-Burton facilities must provide some free care. The NEXUS clinic finder shows all options near you.',
  },
])

/* ─────────────────────────────────────────────────────────────────────────────
   Programs page FAQ content
   ─────────────────────────────────────────────────────────────────────────── */
export const PROGRAMS_FAQ_SCHEMA = faqSchema([
  {
    question: 'What free healthcare programs are available to uninsured Americans?',
    answer:
      'Major programs include: Medicaid (low-income adults and families), CHIP (children under 19), Ryan White Program (HIV/AIDS care), Hill-Burton (free hospital care obligation), 340B Drug Pricing Program (discounted medications), FQHC sliding-scale clinics, and state-specific programs. NEXUS shows you all programs available in your state.',
  },
  {
    question: 'What is CHIP and who qualifies?',
    answer:
      'The Children\'s Health Insurance Program (CHIP) provides free or low-cost health coverage to children in families that earn too much to qualify for Medicaid but cannot afford private insurance. In most states, children up to age 19 in families earning up to 200–300% of the Federal Poverty Level qualify.',
  },
  {
    question: 'Are there free programs for prescription medications?',
    answer:
      'Yes. Most major pharmaceutical companies offer Patient Assistance Programs (PAPs) for uninsured patients. The 340B program provides deeply discounted medications at qualifying health centers. NeedyMeds, RxAssist, and GoodRx can also dramatically reduce medication costs.',
  },
  {
    question: 'What is a Federally Qualified Health Center (FQHC)?',
    answer:
      'FQHCs are federally funded community health centers required to serve everyone regardless of ability to pay, insurance status, or immigration status. They charge on a sliding scale based on your income — you may pay $0 or a small fee. There are over 1,400 FQHC organizations with 14,000+ locations nationwide.',
  },
])
