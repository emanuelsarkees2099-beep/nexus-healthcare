/**
 * AXVO partner organizations. Every fact here is taken from the partner's
 * own public site (incitefulmed.com) or from the partner directly -- no
 * invented numbers. Figures are labeled as the partner's own where shown.
 */
export type Partner = {
  slug: string
  name: string
  url: string
  logo: string
  tagline: string
  summary: string
  /** Brand colors pulled from the partner's logo file */
  color: string
  colorAlt: string
  interviewHref?: string
}

export const PARTNERS: Partner[] = [
  {
    slug: 'inciteful-med',
    name: 'Inciteful Med',
    url: 'https://incitefulmed.com',
    logo: '/partners/inciteful-med-logo.svg',
    tagline: 'A health advocacy tool that helps you understand and act on your medical evidence.',
    summary: 'You ask a health question in plain language, and Inciteful Med searches more than 42 million peer-reviewed papers and explains what the research says, citing the exact passage behind every statement.',
    color: '#9B25EA',
    colorAlt: '#C70FE9',
    interviewHref: '/editorial/inciteful-med-interview',
  },
]

export function findPartner(slug: string): Partner | undefined {
  return PARTNERS.find(p => p.slug === slug)
}
