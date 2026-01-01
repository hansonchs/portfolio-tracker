import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function reportWebVitals(metric: any) {
  // You can send metrics to your analytics service here
  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    // analytics.track('web-vitals', metric)
  }
}

export default function VercelAnalytics() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
