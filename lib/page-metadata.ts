/**
 * NEXUS — Centralized page metadata
 * Each route's layout.tsx imports from here to keep metadata DRY
 * and easy to update in one place.
 *
 * Pattern: layout.tsx does:
 *   export const metadata = PAGE_META.search
 */
import type { Metadata } from 'next'

const BASE_URL     = 'https://nexus.health'
const SITE_NAME    = 'NEXUS'
const DEFAULT_OG   = `${BASE_URL}/og-default.png`
const KEYWORDS_BASE = ['free healthcare', 'free clinic', 'uninsured', 'no insurance', 'healthcare access']

function meta(
  title: string,
  description: string,
  keywords: string[] = [],
  ogImage = DEFAULT_OG,
): Metadata {
  return {
    title:       `${title} — ${SITE_NAME}`,
    description,
    keywords:    [...KEYWORDS_BASE, ...keywords],
    openGraph: {
      title:       `${title} — ${SITE_NAME}`,
      description,
      siteName:    SITE_NAME,
      type:        'website',
      images:      [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${title} — ${SITE_NAME}`,
      description,
      images:      [ogImage],
    },
    alternates: { canonical: BASE_URL },
  }
}

export const PAGE_META = {
  search: meta(
    'Find Free Clinics Near You',
    'Search thousands of free and sliding-scale clinics, community health centers, and federally qualified health centers near you — no insurance required.',
    ['find free clinic', 'community health center', 'FQHC', 'sliding scale'],
  ),

  triage: meta(
    'Symptom Triage',
    'Answer a few questions about your symptoms and get personalized guidance on where to seek care — free, fast, and private.',
    ['symptom checker', 'healthcare triage', 'when to go to ER', 'urgent care'],
  ),

  crisis: meta(
    'Crisis & Emergency Resources',
    'Immediate help for mental health crises, domestic violence, substance abuse, and medical emergencies. Free hotlines, chat, and local resources.',
    ['mental health crisis', '988', 'suicide hotline', 'crisis resources', 'emergency help'],
  ),

  programs: meta(
    'Free Healthcare Programs',
    'Discover Medicaid, CHIP, Ryan White, Hill-Burton, and hundreds of federal and state programs that cover care at no cost to you.',
    ['Medicaid', 'CHIP', 'Ryan White', 'Hill-Burton', 'free healthcare programs', 'government assistance'],
  ),

  community: meta(
    'Community Stories',
    'Real stories from Americans who found free healthcare through NEXUS. Read how others navigated the system — and share your own experience.',
    ['healthcare stories', 'patient stories', 'community', 'uninsured experience'],
  ),

  passport: meta(
    'Health Passport',
    'Store and organize your medical records, prescriptions, vaccination history, and insurance cards securely in one place.',
    ['health records', 'medical passport', 'vaccination records', 'prescription history'],
  ),

  gps: meta(
    'Care GPS — Navigate Your Healthcare',
    'Step-by-step guidance for navigating the US healthcare system without insurance. From urgent care to specialists, we map the path for you.',
    ['navigate healthcare', 'healthcare guide', 'uninsured guide', 'care navigation'],
  ),

  equity: meta(
    'Health Equity Resources',
    'Resources addressing racial health disparities, language barriers, and access gaps. Every person deserves equitable, dignified care.',
    ['health equity', 'racial health disparities', 'language access', 'healthcare disparities'],
  ),

  editorial: meta(
    'Healthcare News & Guides',
    'Evidence-based healthcare guides, policy updates, and practical tips for uninsured and underinsured Americans.',
    ['healthcare news', 'healthcare policy', 'health guides', 'uninsured tips'],
  ),

  telehealth: meta(
    'Free Telehealth Services',
    'Connect with doctors, therapists, and specialists online for free or low cost. No insurance needed — appointments available today.',
    ['free telehealth', 'online doctor', 'virtual visit', 'telemedicine free'],
  ),

  advocacy: meta(
    'Advocacy — Make Your Voice Heard',
    'Sign petitions, contact your representatives, and track legislation that affects healthcare access for millions of uninsured Americans.',
    ['healthcare advocacy', 'contact congress', 'healthcare legislation', 'patient rights advocacy'],
  ),

  eligibility: meta(
    'Check Your Healthcare Eligibility',
    'Find out in minutes which free healthcare programs you qualify for based on your income, household size, and state. No sign-up required.',
    ['healthcare eligibility', 'Medicaid eligibility', 'qualify for free healthcare', 'income based healthcare'],
  ),

  provider: meta(
    'For Healthcare Providers',
    'List your free or sliding-scale clinic on NEXUS to reach the 30 million uninsured Americans who need your services.',
    ['healthcare provider', 'list clinic', 'FQHC directory', 'free clinic provider'],
  ),

  stories: meta(
    'Share Your Story',
    'Share your experience navigating healthcare without insurance. Your story can help others in the same situation find care.',
    ['share healthcare story', 'patient experience', 'uninsured story'],
  ),

  chw: meta(
    'Community Health Workers',
    'Connect with trained community health workers who can guide you to local resources, navigate enrollment, and provide support in your language.',
    ['community health worker', 'CHW', 'promotora', 'health navigator', 'patient advocate'],
  ),

  rights: meta(
    'Know Your Patient Rights',
    'Every patient has rights regardless of insurance status. Learn about EMTALA, HIPAA, informed consent, and how to fight unfair billing.',
    ['patient rights', 'EMTALA', 'hospital billing rights', 'HIPAA', 'informed consent'],
  ),

  accessibility: meta(
    'Accessibility & Language Access',
    'NEXUS is committed to full accessibility. Report barriers, request language support, or find resources in your language.',
    ['accessibility', 'language access', 'ADA', 'translation services', 'disability healthcare'],
  ),

  login: meta(
    'Sign In',
    'Sign in to your NEXUS account to access your saved clinics, submissions, and health passport.',
    [],
  ),

  signup: meta(
    'Create Your Free Account',
    'Join NEXUS to save clinics, track programs, share your story, and get personalized healthcare guidance. Always free.',
    ['create account', 'sign up', 'free account'],
  ),

  forgotPassword: meta(
    'Reset Your Password',
    'Reset your NEXUS account password. We\'ll send a reset link to your email address.',
    [],
  ),

  dashboard: meta(
    'Your Dashboard',
    'Your personalized NEXUS dashboard — saved clinics, active programs, and your health passport in one place.',
    [],
  ),

  profile: meta(
    'Your Profile',
    'Manage your NEXUS account details, notification preferences, and privacy settings.',
    [],
  ),

  calendar: meta(
    'Health Calendar',
    'Schedule appointments, set medication reminders, and track your health visits — all in one place.',
    ['health calendar', 'appointment reminder', 'health tracking'],
  ),

  impact: meta(
    'Our Impact',
    'See how NEXUS is connecting uninsured Americans to free healthcare — by the numbers.',
    ['healthcare impact', 'NEXUS statistics', 'free clinic impact'],
  ),

  equity2: meta(
    'Equity Report',
    'Data and analysis on healthcare access gaps across race, income, geography, and immigration status.',
    ['health equity report', 'healthcare data', 'access gap'],
  ),
} as const
