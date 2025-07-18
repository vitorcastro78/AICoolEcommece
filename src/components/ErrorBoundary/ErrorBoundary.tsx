tsx
import React, { Component, ReactNode, ErrorInfo, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Optional custom fallback UI. Receives error and resetErrorBoundary.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode
  /**
   * Optional callback when error is caught.
   */
  onError?: (error: Error, info: ErrorInfo) => void
  /**
   * Optional callback when error boundary is reset.
   */
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * ErrorBoundary component for ecommerce subscription flows.
 * Catches errors in children, displays animated fallback UI, and supports reset.
 */
class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) this.props.onError(error, info)
  }

  resetErrorBoundary = () => {
    this.setState({ error: null })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    const { error } = this.state
    const { children, fallback } = this.props

    if (error) {
      return (
        <ErrorFallback
          error={error}
          reset={this.resetErrorBoundary}
          fallback={fallback}
        />
      )
    }
    return children
  }
}

interface ErrorFallbackProps {
  error: Error
  reset: () => void
  fallback?: (error: Error, reset: () => void) => ReactNode
}

/**
 * Animated error fallback UI for ErrorBoundary.
 */
const ErrorFallback = React.memo<ErrorFallbackProps>(({ error, reset, fallback }) => {
  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  const fallbackContent = useMemo(() => {
    if (fallback) return fallback(error, handleReset)
    return (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg mx-auto max-w-lg"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="w-10 h-10 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2" tabIndex={0}>
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-center mb-4 max-w-xs" tabIndex={0}>
          {error.message}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition"
          aria-label="Try again"
        >
          Try Again
        </button>
      </motion.div>
    )
  }, [error, handleReset, fallback])

  return (
    <AnimatePresence>
      {fallbackContent}
    </AnimatePresence>
  )
})

/**
 * ErrorBoundary for ecommerce subscription apps.
 * Use to wrap critical UI to catch and display errors with animation and accessibility.
 */
export const ErrorBoundary = React.memo(function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />
})

