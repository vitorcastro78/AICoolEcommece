tsx
import React, { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface RatingProps {
  /** Current rating value (0-5, can be decimal) */
  value: number
  /** Callback when user selects a rating */
  onChange?: (value: number) => void
  /** If true, disables interaction */
  disabled?: boolean
  /** If true, shows loading spinner */
  loading?: boolean
  /** If true, shows error message */
  error?: string
  /** Number of stars (default 5) */
  max?: number
  /** Size of stars (Tailwind text size, e.g. 'text-2xl') */
  sizeClass?: string
  /** ARIA label for the rating group */
  'aria-label'?: string
  /** Custom className */
  className?: string
}

const starVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: -8 },
  tap: { scale: 0.95, rotate: 0 },
  selected: { scale: 1.1, rotate: 0 },
}

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: { repeat: Infinity, duration: 0.8, ease: 'linear' },
  },
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

/**
 * Responsive, accessible, animated rating component for ecommerce subscriptions.
 */
export const Rating: React.FC<RatingProps> = React.memo(
  ({
    value,
    onChange,
    disabled = false,
    loading = false,
    error,
    max = 5,
    sizeClass = 'text-2xl md:text-3xl',
    'aria-label': ariaLabel = 'Product rating',
    className = '',
  }) => {
    const [hovered, setHovered] = React.useState<number | null>(null)
    const [focusIndex, setFocusIndex] = React.useState<number | null>(null)

    const displayValue = useMemo(() => clamp(value, 0, max), [value, max])

    const handleStarClick = useCallback(
      (idx: number) => {
        if (disabled || loading || !onChange) return
        onChange(idx + 1)
      },
      [onChange, disabled, loading]
    )

    const handleStarKeyDown = useCallback(
      (idx: number, e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (disabled || loading) return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault()
          setFocusIndex(i => (i === null ? idx - 1 : Math.max(0, i - 1)))
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault()
          setFocusIndex(i => (i === null ? idx + 1 : Math.min(max - 1, i + 1)))
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (onChange) onChange(idx + 1)
        }
      },
      [onChange, disabled, loading, max]
    )

    const handleStarFocus = useCallback((idx: number) => setFocusIndex(idx), [])
    const handleStarBlur = useCallback(() => setFocusIndex(null), [])

    const stars = useMemo(() => {
      return Array.from({ length: max }).map((_, i) => {
        const filled =
          hovered !== null
            ? i < hovered + 1
            : i + 1 <= Math.floor(displayValue)
        const half =
          hovered === null &&
          i === Math.floor(displayValue) &&
          displayValue % 1 >= 0.5
        const isSelected = i + 1 === Math.round(displayValue)
        return (
          <motion.button
            key={i}
            type="button"
            aria-label={`Rate ${i + 1} out of ${max}`}
            aria-checked={i + 1 === Math.round(displayValue)}
            tabIndex={disabled || loading ? -1 : focusIndex === i ? 0 : -1}
            disabled={disabled || loading}
            className={`relative bg-transparent border-none outline-none p-1 transition-colors duration-150
              ${sizeClass}
              ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              ${isSelected ? 'text-yellow-400' : 'text-gray-300'}
              focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:z-10
            `}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => handleStarFocus(i)}
            onBlur={handleStarBlur}
            onClick={() => handleStarClick(i)}
            onKeyDown={e => handleStarKeyDown(i, e)}
            role="radio"
            animate={
              hovered === i
                ? 'hover'
                : isSelected
                ? 'selected'
                : 'initial'
            }
            variants={starVariants}
            whileTap="tap"
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <span className="sr-only">{`Rate ${i + 1} out of ${max}`}</span>
            <span
              aria-hidden="true"
              className="block"
              style={{ width: '1em', height: '1em' }}
            >
              {half ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-[1em] h-[1em]"
                >
                  <defs>
                    <linearGradient id={`half-star-${i}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill={`url(#half-star-${i})`}
                  />
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill={filled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={filled ? 0 : 1.5}
                  className="w-[1em] h-[1em]"
                >
                  <path
                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                  />
                </svg>
              )}
            </span>
          </motion.button>
        )
      })
    }, [
      max,
      hovered,
      displayValue,
      disabled,
      loading,
      focusIndex,
      handleStarClick,
      handleStarKeyDown,
      handleStarFocus,
      handleStarBlur,
      sizeClass,
    ])

    return (
      <div
        className={`flex items-center gap-1 sm:gap-2 ${className}`}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || loading}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              key="spinner"
              className="flex items-center justify-center w-8 h-8"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              aria-label="Loading"
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-yellow-400 animate-spin"
                variants={spinnerVariants}
                animate="animate"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
        {!loading && (
          <div className="flex items-center" aria-live="polite">
            {stars}
          </div>
        )}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              className="ml-2 text-sm text-red-500"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)
