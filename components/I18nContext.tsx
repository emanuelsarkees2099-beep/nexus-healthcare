'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSavedLang, t as tFn, type LangCode, type TranslationKey } from '@/lib/i18n'

interface I18nContextValue {
  lang: LangCode
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue>({ lang: 'en', t: (k) => k })

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>('en')

  useEffect(() => {
    // Read saved language on mount
    const saved = getSavedLang()
    setLang(saved)

    // Listen for language changes from LanguageSelector
    const handler = () => setLang(getSavedLang())
    window.addEventListener('nexus:lang-changed', handler)
    return () => window.removeEventListener('nexus:lang-changed', handler)
  }, [])

  const tWrapper = (key: TranslationKey) => tFn(key, lang)

  return (
    <I18nContext.Provider value={{ lang, t: tWrapper }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
