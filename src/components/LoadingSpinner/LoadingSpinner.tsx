tsx
import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'

export interface LoadingSpinnerProps {
  /** If true, spinner is visible */
  loading?: boolean
  /** Optional error message to display */
  error?: string | null
  /** Spinner size in pixels (default: 48) */
  size?: number
  /** Spinner color (default: Tailwind 'primary') */
  colorClass?: string
  /** ARIA label for accessibility */
  label?: string
  /** Optional children to render below spinner/error */
  children?: React.ReactNode
  /** Optional className for container */
  className?: string
}

/**
 * Responsive, accessible loading spinner for ecommerce subscription flows.
 */
export const LoadingSpinner = memo(function LoadingSpinner({
  loading = true,
  error = null,
  size = 48,
  colorClass = 'text-primary',
  label = 'Loading',
  children,
  className = '',
}: LoadingSpinnerProps) {
  const spinnerId = useMemo(() => `spinner-${Math.random().toString(36).slice(2)}`, [])

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={`flex flex-col items-center justify-center min-h-[120px] p-4 ${className}`}
      >
        <div className="flex items-center gap-2 text-red-600 text-base font-medium" aria-describedby={spinnerId}>
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M9.17 9.17l5.66 5.66M14.83 9.17l-5.66 5.66"
            />
          </svg>
          <span id={spinnerId}>{typeof error === 'string' ? error : 'An error occurred.'}</span>
        </div>
        {children && <div className="mt-2 w-full">{children}</div>}
      </div>
    )
  }

  if (!loading) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={`flex flex-col items-center justify-center min-h-[120px] p-4 ${className}`}
    >
      <motion.span
        className={`inline-flex items-center justify-center`}
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <motion.svg
          width={size}
          height={size}
          viewBox="0 0 48 48"
          className={`animate-spin-slow ${colorClass}`}
          aria-hidden="true"
        >
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset="60"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 60 }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              duration: 1.2,
              ease: 'easeInOut',
            }}
            style={{ transformOrigin: 'center' }}
          />
          <motion.circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeOpacity={0.15}
          />
        </motion.svg>
      </motion.span>
      <span className="sr-only">{label}</span>
      {children && <div className="mt-2 w-full">{children}</div>}
    </div>
  )
})

export default LoadingSpinner

