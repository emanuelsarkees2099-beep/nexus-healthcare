/**
 * AXVO — Centralized page metadata
 * Each route's layout.tsx imports from here to keep metadata DRY
 * and easy to update in one place.
 *
 * P5: All pages now use the dynamic /api/og edge function to generate
 * OG images with page-specific titles, subtitles, and accent colours.
 *
 * Pattern: layout.tsx does:
 *   export const metadata = PAGE_META.search
 *
 * SEO fix (2026-09): every entry's `alternates.canonical` was hardcoded to
 * BASE_URL (the bare homepage) -- confirmed live, every single inner page
 * (/search, /programs, /eligibility, all 30 of them) was telling Google its
 * canonical version was the homepage. That's a signal to consolidate/drop
 * the "duplicate" from the index in favor of the homepage -- meaning Google
 * had reason to treat the entire rest of the site as non-canonical
 * duplicates of `/`, not distinct pages worth ranking on their own. Added a
 * required `path` param so every page finally points to itself.
 */
import type { Metadata } from 'next'

const BASE_URL      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.axvohealth.com'
const SITE_NAME     = 'AXVO'
const KEYWORDS_BASE = ['free healthcare', 'free clinic', 'uninsured', 'no insurance', 'healthcare access']

/**
 * Build a dynamic OG image URL via the /api/og edge function.
 * Params map to the route's GET handler in app/api/og/route.tsx.
 */
function ogUrl(params: Record<string, string>): string {
  const p = new URLSearchParams(params)
  return `${BASE_URL}/api/og?${p.toString()}`
}

function meta(
  title: string,
  description: string,
  /** The page's real route, e.g. '/search' -- becomes both the canonical URL and openGraph.url. */
  path: string,
  keywords: string[] = [],
  /** P5: page key used to build /api/og?page=... — defaults to generating from title */
  ogParams?: Record<string, string>,
): Metadata {
  const ogImageUrl = ogUrl(ogParams ?? { title, sub: description.slice(0, 90) })
  const url = `${BASE_URL}${path}`
  return {
    title:       `${title} — ${SITE_NAME}`,
    description,
    keywords:    [...KEYWORDS_BASE, ...keywords],
    openGraph: {
      title:       `${title} — ${SITE_NAME}`,
      description,
      url,
      siteName:    SITE_NAME,
      type:        'website',
      images:      [{ url: ogImageUrl, width: 1200, height: 630, alt: `${title} — ${SITE_NAME}` }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${title} — ${SITE_NAME}`,
      description,
      images:      [ogImageUrl],
    },
    alternates: { canonical: url },
  }
}

export const PAGE_META = {
  /* ── Core search & discovery ─────────────────────────────────── */
  search: meta(
    'Find Free Clinics Near You',
    'Search thousands of free and sliding-scale clinics, community health centers, and federally qualified health centers near you — no insurance required.',
    '/search',
    ['find free clinic', 'community health center', 'FQHC', 'sliding scale'],
    { page: 'search' },
  ),

  medications: meta(
    'Medication Assistance Finder',
    'Find manufacturer PAP programs, GoodRx coupons, NeedyMeds listings, and 340B pricing for your medications — free or deeply discounted.',
    '/medications',
    ['medication assistance', 'patient assistance program', 'PAP', 'GoodRx', 'NeedyMeds', 'free medications', 'cheap medications', 'cheap prescriptions'],
    { page: 'medications' },
  ),

  eligibility: meta(
    'Check Your Healthcare Eligibility',
    'Find out in minutes which free healthcare programs you qualify for based on your income, household size, and state. No sign-up required.',
    '/eligibility',
    ['healthcare eligibility', 'Medicaid eligibility', 'qualify for free healthcare', 'income based healthcare'],
    { page: 'eligibility' },
  ),

  programs: meta(
    'Free Healthcare Programs',
    'Discover Medicaid, CHIP, Ryan White, Hill-Burton, and hundreds of federal and state programs that cover care at no cost to you.',
    '/programs',
    ['Medicaid', 'CHIP', 'Ryan White', 'Hill-Burton', 'free healthcare programs', 'government assistance'],
    { page: 'programs' },
  ),

  triage: meta(
    'Symptom Guide',
    'Describe your symptoms and get guidance on what level of care to seek — matched to published clinical guidelines. Not a diagnosis. Free and private.',
    '/triage',
    ['symptom guide', 'symptom checker', 'what level of care', 'when to go to ER', 'urgent care'],
    { page: 'triage' },
  ),

  crisis: meta(
    'Crisis & Emergency Resources',
    'Immediate help for mental health crises, domestic violence, substance abuse, and medical emergencies. Call 988 for the Suicide & Crisis Lifeline.',
    '/crisis',
    ['mental health crisis', '988', 'suicide hotline', 'crisis resources', 'emergency help'],
    { page: 'crisis' },
  ),

  /* ── Content & tools ─────────────────────────────────────────── */
  pathways: meta(
    'Care Pathways — Know Your Options',
    'Explore guided care pathways for common health situations — find the right type of care at the right cost.',
    '/pathways',
    ['care pathways', 'healthcare options', 'care navigation', 'what type of care'],
    { page: 'pathways' },
  ),

  rights: meta(
    'Know Your Patient Rights',
    'Every patient has rights regardless of insurance status. Learn about EMTALA, HIPAA, informed consent, and how to fight unfair billing.',
    '/rights',
    ['patient rights', 'EMTALA', 'hospital billing rights', 'HIPAA', 'informed consent'],
    { page: 'rights' },
  ),

  equity: meta(
    'Health Equity Resources',
    'Resources addressing racial health disparities, language barriers, and access gaps. Every person deserves equitable, dignified care.',
    '/equity',
    ['health equity', 'racial health disparities', 'language access', 'healthcare disparities'],
    { page: 'equity' },
  ),

  impact: meta(
    'Our Impact',
    'See how AXVO is connecting uninsured Americans to free healthcare — by the numbers.',
    '/impact',
    ['healthcare impact', 'AXVO statistics', 'free clinic impact'],
    { page: 'impact' },
  ),

  /* ── Account & personal ──────────────────────────────────────── */
  dashboard: meta(
    'Your Dashboard',
    'Your personalized AXVO dashboard — saved clinics, active programs, and your health passport in one place.',
    '/dashboard',
    [],
    { title: 'Your AXVO Dashboard', sub: 'Saved clinics, programs, and your health journey.' },
  ),

  profile: meta(
    'Your Profile',
    'Manage your AXVO account details, notification preferences, and privacy settings.',
    '/dashboard/profile',
    [],
    { title: 'Your Profile', sub: 'Account settings and preferences.' },
  ),

  settingsProfile: meta(
    'Profile Settings',
    'Update your AXVO account details, contact information, and notification preferences.',
    '/settings/profile',
    [],
    { title: 'Profile Settings', sub: 'Your account details and preferences.' },
  ),

  settingsSecurity: meta(
    'Security Settings',
    'Manage your AXVO password, two-factor authentication, recovery codes, and active sessions.',
    '/settings/security',
    [],
    { title: 'Security Settings', sub: 'Password, two-factor auth, and sessions.' },
  ),

  passport: meta(
    'Health Passport',
    'Store and organize your medical records, prescriptions, vaccination history, and insurance cards securely in one place.',
    '/passport',
    ['health records', 'medical passport', 'vaccination records', 'prescription history'],
    { title: 'Health Passport', sub: 'Your medical records, organized and portable.' },
  ),

  calendar: meta(
    'Health Calendar',
    'Schedule appointments, set medication reminders, and track your health visits — all in one place.',
    '/calendar',
    ['health calendar', 'appointment reminder', 'health tracking'],
    { title: 'Health Calendar', sub: 'Appointments, reminders, and care tracking.' },
  ),

  /* ── Meta / info ─────────────────────────────────────────────── */
  about: meta(
    'About AXVO',
    'AXVO is a free tool connecting 30 million uninsured Americans to federally-funded health centers, free clinics, and assistance programs.',
    '/about',
    ['about AXVO', 'who we are', 'AXVO mission', 'free healthcare mission'],
    { title: 'About AXVO', sub: 'Free healthcare, found in seconds. No insurance required.' },
  ),

  methodology: meta(
    'Our Data Methodology',
    'How AXVO sources, verifies, and updates free clinic and healthcare program data. Transparency in every record.',
    '/methodology',
    ['data methodology', 'clinic data sources', 'HRSA data', 'NAFC data', 'data accuracy'],
    { title: 'Data Methodology', sub: 'How we source and verify 18,000+ clinic records.' },
  ),

  open: meta(
    'Open Roadmap',
    "AXVO is built in the open. See what we're working on, vote on features, and contribute to the mission.",
    '/open',
    ['open roadmap', 'product roadmap', 'feature requests', 'open source healthcare'],
    { title: 'Open Roadmap', sub: 'What we are building next — vote and contribute.' },
  ),

  outcomes: meta(
    'Health Outcomes Data',
    'Explore data on patient outcomes from FQHC and free clinic visits — how AXVO users improved their health access.',
    '/outcomes',
    ['health outcomes', 'FQHC outcomes', 'free clinic data', 'patient results'],
    { title: 'Health Outcomes Data', sub: 'How care access changes lives — by the numbers.' },
  ),

  // NOTE: not currently imported by any layout.tsx (dead entry, kept for
  // when/if an /equity report sub-page exists) -- given its own path so it
  // doesn't silently collide with `equity` above if it's ever wired up.
  equity2: meta(
    'Equity Report',
    'Data and analysis on healthcare access gaps across race, income, geography, and immigration status.',
    '/equity/report',
    ['health equity report', 'healthcare data', 'access gap'],
    { title: 'Equity Report', sub: 'Healthcare access gaps — race, income, geography, status.' },
  ),

  editorial: meta(
    'Healthcare News & Guides',
    'Evidence-based healthcare guides, policy updates, and practical tips for uninsured and underinsured Americans.',
    '/editorial',
    ['healthcare news', 'healthcare policy', 'health guides', 'uninsured tips'],
    { title: 'Healthcare Guides', sub: 'Evidence-based guides for the uninsured.' },
  ),

  telehealth: meta(
    'Free Telehealth Services',
    'Connect with doctors, therapists, and specialists online for free or low cost. No insurance needed — appointments available today.',
    '/telehealth',
    ['free telehealth', 'online doctor', 'virtual visit', 'telemedicine free'],
    { title: 'Free Telehealth', sub: 'Online doctors and therapists. No insurance needed.' },
  ),

  advocacy: meta(
    'Advocacy — Make Your Voice Heard',
    'Sign petitions, contact your representatives, and track legislation that affects healthcare access for millions of uninsured Americans.',
    '/advocacy',
    ['healthcare advocacy', 'contact congress', 'healthcare legislation', 'patient rights advocacy'],
    { title: 'Healthcare Advocacy', sub: 'Contact your representatives. Track legislation.' },
  ),

  chw: meta(
    'Community Health Workers',
    'Connect with trained community health workers who can guide you to local resources, navigate enrollment, and provide support in your language.',
    '/chw',
    ['community health worker', 'CHW', 'promotora', 'health navigator', 'patient advocate'],
    { title: 'Community Health Workers', sub: 'Trained navigators in your language and community.' },
  ),

  stories: meta(
    'Share Your Story',
    'Share your experience navigating healthcare without insurance. Your story can help others in the same situation find care.',
    '/stories',
    ['share healthcare story', 'patient experience', 'uninsured story'],
    { title: 'Share Your Story', sub: 'Your experience can help others find care.' },
  ),

  login: meta(
    'Sign In',
    'Sign in to your AXVO account to access your saved clinics, submissions, and health passport.',
    '/login',
    [],
    { title: 'Sign In to AXVO', sub: 'Access your saved clinics and health journey.' },
  ),

  signup: meta(
    'Create Your Free Account',
    'Join AXVO to save clinics, track programs, share your story, and get personalized healthcare guidance. Always free.',
    '/signup',
    ['create account', 'sign up', 'free account'],
    { title: 'Create Your Free Account', sub: 'Save clinics, track programs, share your story.' },
  ),

  forgotPassword: meta(
    'Reset Your Password',
    "Reset your AXVO account password. We'll send a reset link to your email address.",
    '/forgot-password',
    [],
    { title: 'Reset Password', sub: 'We will send a reset link to your email.' },
  ),

  resetPassword: meta(
    'Set a New Password',
    'Create a new, secure password to regain access to your AXVO account.',
    '/reset-password',
    [],
    { title: 'Set New Password', sub: 'Choose a strong password for your account.' },
  ),

  verifyEmail: meta(
    'Verify Your Email',
    'Check your inbox to confirm your AXVO account email address.',
    '/verify-email',
    [],
    { title: 'Verify Email', sub: 'One click and you are all set.' },
  ),

  onboarding: meta(
    'Get Started with AXVO',
    'Tell us a little about yourself so we can find the right free healthcare resources for you.',
    '/onboarding',
    ['get started', 'healthcare onboarding', 'personalized care'],
    { title: 'Get Started', sub: 'Find the right care for your situation.' },
  ),

  verify: meta(
    'Verify Your Information',
    'Verify your identity or healthcare information to access additional AXVO features.',
    '/verify',
    [],
    { title: 'Verify', sub: 'Confirm your information to continue.' },
  ),
} as const
