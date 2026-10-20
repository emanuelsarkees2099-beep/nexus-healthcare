/**
 * Single public contact address for the whole site.
 *
 * The site used to list privacy@, security@, legal@, accessibility@, and
 * data@axvohealth.com plus legal@axvo-healthcare.vercel.app -- none of which
 * existed as mailboxes, so every one of them bounced. Everything now routes
 * to one address that matches the sender lib/email.ts already uses. If you
 * later create separate aliases in Zoho, split them out here.
 */
export const CONTACT_EMAIL = 'hello@axvohealth.com'
