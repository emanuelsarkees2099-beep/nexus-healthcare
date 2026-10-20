import type { Metadata } from 'next'
import ComingSoon from '@/components/ComingSoon'

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Previously rendered hardcoded sample clients (MOCK_CLIENTS / MOCK_REQUESTS)
// as if they were a real caseload.
export default function ChwDashboardPage() {
  return (
    <ComingSoon
      title="Community Health Worker dashboard"
      description="A workspace for community health workers to track the people they help is in development. The CHW directory is live in the meantime."
    />
  )
}
