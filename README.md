# NEXUS — Free Healthcare, Found in Seconds

**A comprehensive platform for connecting uninsured Americans with free clinics, sliding-scale care, and eligibility programs.**

![License](https://img.shields.io/badge/license-MIT-blue) ![Status](https://img.shields.io/badge/status-Production-brightgreen)

## Overview

NEXUS is an open-source healthcare discovery platform that aggregates clinic data from 4+ sources (HRSA, NAFC, OpenStreetMap, state APIs) and surfaces the most accessible and affordable options to the 30 million uninsured Americans. The platform combines:

- **Multi-source clinic discovery** with intelligent deduplication
- **Affordability scoring** (0–100 model based on clinic type and pricing structure)
- **AI health navigation** via Claude Haiku (scoped, non-medical advice)
- **Outcome tracking** (opt-in, anonymized impact metrics)
- **Automated validation** (clinic freshness, broken link detection, weekly digests)
- **Privacy-first design** (no PHI, no tracking pixels, IRB-adjacent methodology)

## Core Features

### 🏥 Clinic Finder
- Search by ZIP code or city; results filtered by radius (5–50 miles)
- View on interactive map or list view
- Affordability scores & service categories
- Live data from:
  - **HRSA**: 14,000+ Federally Qualified Health Centers
  - **NAFC**: 130+ verified free & charitable clinics
  - **OpenStreetMap**: Community-sourced clinic tags
  - **Google Places**: Supplementary venue data (optional)
  - **State Health Dept APIs**: CA, TX, NY, FL, IL

### 💬 Health Navigator Chat
- AI-powered Claude Haiku chatbot
- Scoped questions: "Where can I find dental care?", "Do I qualify for Medicaid?", "What's sliding-scale pricing?"
- Explicitly **prevents** medical advice, diagnosis, or treatment recommendations
- Built-in emergency redirects (911 for emergencies, 988 for crisis)

### 📋 Insurance Enrollment Wizard
- Medicaid: State expansion status, online application links, presumptive eligibility
- ACA Marketplace: Enrollment windows, plan comparison, subsidy information
- Quick links to benefits.gov, healthcare.gov, KFF State Map

### 📊 Outcome Tracking
- Optional opt-in: "Did you get care?", "Did you get an appointment?", "Did you enroll in a program?"
- Anonymized aggregation: Top searched ZIPs, event type counts
- No personally identifiable information stored

### ⚙️ Automated Monitoring (Vercel Cron)
1. **Weekly Clinic Freshness** (Sunday 2 AM UTC): Validates top-searched ZIP codes against HRSA API
2. **Weekly Link Validation** (Monday 3 AM UTC): HEAD-checks all program links and clinic websites
3. **Weekly Impact Digest** (Monday 8 AM UTC): Compiles new users, clinic searches, and outcomes; emails summary

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + RLS)
- **Authentication**: Supabase Auth (email/password, Google OAuth)
- **AI Chat**: Anthropic Claude Haiku API
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: OpenStreetMap (Leaflet iframe)
- **Deployment**: Vercel (Node.js serverless)
- **Email**: Resend API
- **State**: React Context, localStorage (persistent ZIP codes)

## Getting Started

### Prerequisites
```bash
Node.js 18+, npm/yarn, Supabase account, Vercel account, Anthropic API key
```

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/nexus-healthcare.git
cd nexus-healthcare
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (Claude Haiku)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Google Places API
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...

# Optional: Email (Resend)
RESEND_API_KEY=re_...

# Vercel Cron Secret (for automated jobs)
CRON_SECRET=your-secret-key

# Vercel Production URL (for email links)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Database Setup
In Supabase SQL Editor, run the SQL DDL from the `scripts/schema.sql` file or copy this:

```sql
CREATE TABLE IF NOT EXISTS clinics_cache (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  services TEXT[],
  free BOOLEAN DEFAULT true,
  sliding_scale BOOLEAN DEFAULT true,
  url TEXT,
  hours TEXT,
  lat FLOAT,
  lng FLOAT,
  type TEXT DEFAULT 'FQHC',
  source TEXT DEFAULT 'hrsa',
  affordability_score INT DEFAULT 95,
  last_verified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clinics_cache_state_idx ON clinics_cache(state);
CREATE INDEX IF NOT EXISTS clinics_cache_zip_idx ON clinics_cache(zip);
```

### 4. (Optional) Seed HRSA Clinics
```bash
npx ts-node scripts/seed-hifld.ts
```
Bulk-seeds clinics_cache with ~14,000 HRSA FQHC sites (4–8 hour runtime).

### 5. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

## Data Sources & Methodology

### Affordability Scoring (0–100 scale)
| Signal | Points |
|--------|--------|
| FQHC name/tag | +50 |
| "Free clinic" | +45 |
| "Sliding scale" | +40 |
| County health dept | +28 |
| Charity care programs | +20 |
| Medicaid accepted | +15 |
| **Deductions** | |
| Urgent care | −30 |
| Private practice | −25 |
| Concierge/premium | −40 |

**Examples**:
- FQHC + Sliding Scale = 90–95
- Free clinic + Primary care = 85–90
- County health dept = 68–75
- Private practice (no indicators) = 20–40

### Deduplication
Clinics are deduplicated using a **name fingerprint** (first 12 alphanumeric characters) across all sources. Priority order: HRSA > NAFC > OpenStreetMap > state APIs > Google Places.

### Data Freshness
- **HRSA**: ISR cache 1 hour (real-time API calls)
- **OSM**: ISR cache 2 hours
- **State APIs**: ISR cache 24 hours
- **Nominatim geocoding**: ISR cache 24 hours
- **Validation**: Weekly freshness checks via Vercel Cron

## API Endpoints

### `GET /api/clinics?zip=90001&radius=25`
Aggregates clinic data from all sources.

### `POST /api/chat`
Health navigator chatbot powered by Claude Haiku.

### `POST /api/outcomes`
Log outcome events (clinic_visited, appointment_made, etc).

### `GET /api/outcomes`
Aggregate anonymized outcome statistics.

## Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Cron Jobs (Auto-configured)
- `refresh-clinics`: Sunday 2 AM UTC
- `broken-links`: Monday 3 AM UTC  
- `weekly-digest`: Monday 8 AM UTC

## Privacy & Data Policy

- **No PHI**: Platform never collects medical history or diagnoses
- **Opt-in Tracking**: Outcomes are voluntary; anonymous aggregation only
- **No 3rd-party Pixels**: No Google Analytics, Mixpanel, or ad networks
- **RLS Enforcement**: Supabase Row-Level Security prevents unauthorized access
- **Transparent Methodology**: Full scoring model published at `/methodology`

## Roadmap

- [ ] User authentication & profile management
- [ ] Saved clinics list (wishlist)
- [ ] Insurance plan comparison engine
- [ ] Telehealth provider directory
- [ ] Appointment booking integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## Contributing

Contributions welcome! Open an issue or submit a PR.

## License

MIT License. See `LICENSE` file for details.

## Citation

```bibtex
@software{nexus2024,
  author = {NEXUS Healthcare Team},
  title = {NEXUS: Open-source Free Healthcare Discovery Platform},
  url = {https://github.com/yourusername/nexus-healthcare},
  year = {2024}
}
```

## Acknowledgments

- **HRSA**: Federally Qualified Health Center data
- **NAFC**: National Association of Free & Charitable Clinics
- **OpenStreetMap**: Community-driven geospatial data
- **Anthropic**: Claude Haiku API
- **Supabase**: PostgreSQL platform
- **Vercel**: Serverless deployment & cron infrastructure

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: contact@nexus.health

---

**Built with ❤️ for accessible healthcare.**
