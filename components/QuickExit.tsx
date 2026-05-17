'use client'
/**
 * QuickExit — WCAG A6
 * A visible "Leave quickly" button for sensitive pages (crisis, triage, DV resources).
 * On click it navigates to a neutral external site (weather.com) and replaces history
 * so the user can't easily back-navigate to the sensitive page.
 *
 * Usage:  <QuickExit />   — drop anywhere in a sensitive page layout
 */

export default function QuickExit() {
  const handleExit = () => {
    // Replace current history entry so back button won't return here
    window.location.replace('https://weather.com')
  }

  return (
    <button
      type="button"
      onClick={handleExit}
      className="quick-exit-btn"
      aria-label="Leave this page quickly and go to a safe site"
      title="Click to quickly leave this page"
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Leave quickly
    </button>
  )
}
