'use client'
import { Logout } from 'iconsax-react'
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
      <Logout size={12} color="currentColor" variant="Linear" aria-hidden="true" />
      Leave quickly
    </button>
  )
}
