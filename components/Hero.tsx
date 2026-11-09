'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nContext'
import SearchBar from '@/components/hero/SearchBar'
import LivingProof from '@/components/hero/LivingProof'

const PLACEHOLDER = 'Symptom, service, or clinic name'

const SYMPTOM_PATTERNS = [
  /\b(chest\s*pain|shortness\s*of\s*breath|can['’]?t\s*breathe)\b/i,
  /\b(rash|itching|hives|skin\s+problem|eczema)\b/i,
  /\b(can['’]?t\s+sleep|insomnia|anxiety|depression|mental\s+health)\b/i,
  /\b(headache|migraine|dizziness|fainting)\b/i,
  /\b(fever|cough|cold|flu|sick|nausea|vomiting)\b/i,
  /\b(back\s*pain|joint\s*pain|knee|shoulder)\b/i,
  /\b(stomach\s*pain|abdominal|cramps|diarr)\b/i,
  /\b(tooth\s*ache|toothache|gum|dental\s*pain)\b/i,
  /\b(blood|bleeding|wound|swelling)\b/i,
]

/* Homepage hero. Deliberately static: the headline and search are visible
   on first paint, with no entrance animation that could leave the page
   blank on a slow phone. */
export default function Hero() {
  const { t } = useI18n()
  const router = useRouter()
  const inputRef  = useRef<HTMLInputElement>(null)
  const ctaBtnRef = useRef<HTMLButtonElement>(null)

  const [searchVal, setSearchVal]     = useState('')
  const [locationVal, setLocationVal] = useState('')

  /* restore saved location */
  useEffect(() => {
    try {
      const s = localStorage.getItem('axvo_location') || localStorage.getItem('axvo_zip') || ''
      if (s) setLocationVal(s)
    } catch { /* private browsing */ }
  }, [])

  const handleSearch = useCallback(() => {
    const q = searchVal.trim()
    const loc = locationVal.trim()
    if (!q) {
      router.push(loc ? `/search?loc=${encodeURIComponent(loc)}` : '/search')
      return
    }
    const isSymptom = SYMPTOM_PATTERNS.some(rx => rx.test(q))
    router.push(
      isSymptom
        ? `/triage?symptom=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`
        : `/search?q=${encodeURIComponent(q)}&loc=${encodeURIComponent(loc)}`
    )
  }, [searchVal, locationVal, router])

  return (
    <section
      id="hero"
      aria-labelledby="hero-h1"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'clamp(112px, 16vh, 160px) clamp(20px, 4vw, 48px) 64px',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ maxWidth: '760px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-3)', marginBottom: '20px', fontFamily: 'var(--font-inter)' }}>
          Free to use · No insurance or account needed
        </p>

        <h1
          id="hero-h1"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: 'var(--text)',
          }}
        >
          Find free and low-cost health care near you.
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 1.4vw, 18px)', color: 'var(--text-2)', maxWidth: '560px',
          lineHeight: 1.65, marginBottom: '32px', fontFamily: 'var(--font-inter)',
        }}>
          {t('home.hero.subheadline')}
        </p>

        <div style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 30 }}>
          <SearchBar
            searchVal={searchVal}
            setSearchVal={setSearchVal}
            locationVal={locationVal}
            setLocationVal={setLocationVal}
            onSearch={handleSearch}
            placeholder={PLACEHOLDER}
            inputRef={inputRef}
            ctaBtnRef={ctaBtnRef}
          />
        </div>

        {/* Real clinics near the visitor, loaded from AXVO's data */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <LivingProof />
        </div>
      </div>

      <style>{`
        .search-submit:active { transform: scale(0.98) !important; }
        .geo-btn:hover { opacity: 1 !important; }
      `}</style>
    </section>
  )
}
