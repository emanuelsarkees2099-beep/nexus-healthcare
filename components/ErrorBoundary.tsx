'use client'
import React from 'react'

interface Props {
  children: React.ReactNode
  /** Custom fallback UI. Receives `error` and a `reset` callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  /** Short label shown in default fallback for context (e.g. "Clinic Map") */
  label?: string
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production Sentry would capture here; for now just log
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    const { children, fallback, label } = this.props

    if (error) {
      if (fallback) return fallback(error, this.reset)

      return (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '28px 24px',
            borderRadius: '16px',
            background: 'rgba(248,113,113,0.05)',
            border: '1px solid rgba(248,113,113,0.18)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '10px' }} aria-hidden="true">⚠️</div>
          <p style={{
            fontSize: '14px', fontWeight: 600,
            color: '#f87171',
            fontFamily: 'var(--font-inter)',
            marginBottom: '6px',
          }}>
            {label ? `${label} failed to load` : 'Something went wrong'}
          </p>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-inter)',
            marginBottom: '16px',
            lineHeight: 1.6,
          }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.reset}
            style={{
              padding: '8px 18px',
              borderRadius: '9px',
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return children
  }
}
