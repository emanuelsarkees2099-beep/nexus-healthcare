import ComingSoon from '@/components/ComingSoon'

// The previous version of this page played a fake "submitting…" animation
// and showed "Verification submitted!" without saving anything. Until
// reports are actually stored and reviewed, say so honestly.
export default function VerifyPage() {
  return (
    <ComingSoon
      title="Clinic verification"
      description="Soon you'll be able to confirm a clinic's hours, services, and costs to help the next person. For now, if you spot wrong information on a clinic page, use the “Report outdated or incorrect information” link at the bottom of it."
    />
  )
}
