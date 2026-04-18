'use client'
import { useEffect, useState } from 'react'

type LiveStats = {
  total: number
  users: number
  recent30Days: number
  storiesShared: number
  chwRequests: number
  legalAid: number
  advocacy: number
  resolved: number
  byType: Record<string, number>
  byStatus: Record<string, number>
}

const DEFAULT: LiveStats = {
  total: 0, users: 0, recent30Days: 0,
  storiesShared: 0, chwRequests: 0, legalAid: 0,
  advocacy: 0, resolved: 0, byType: {}, byStatus: {},
}

export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { if (!data.error) setStats(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
