tsx
import React, { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface PaginationProps {
  /** Current page (1-based) */
  page: number
  /** Total number of items */
  total: number
  /** Items per page */
  pageSize: number
  /** Called when page changes */
  onPageChange: (page: number) => void
  /** Loading state */
  isLoading?: boolean
  /** Error message (if any) */
  error?: string | null
  /** Max number of page buttons to show (default: 5) */
  maxPageButtons?: number
  /** Optional: aria-label for navigation */
  ariaLabel?: string
  /** Optional: disables all controls */
  disabled?: boolean
}

/**
 * Responsive, accessible, animated pagination component for ecommerce subscriptions.
 */
export const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    page,
    total,
    pageSize,
    onPageChange,
    isLoading = false,
    error = null,
    maxPageButtons = 5,
    ariaLabel = 'Pagination Navigation',
    disabled = false,
  }) => {
    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

    const getPageNumbers = useCallback(() => {
      if (totalPages <= maxPageButtons) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }
      const half = Math.floor(maxPageButtons / 2)
      let start = Math.max(1, page - half)
      let end = Math.min(totalPages, page + half)
      if (page <= half) {
        end = maxPageButtons
      } else if (page + half > totalPages) {
        start = totalPages - maxPageButtons + 1
      }
      return Array.from({ length: maxPageButtons }, (_, i) => start + i)
    }, [page, totalPages, maxPageButtons])

    const pageNumbers = useMemo(getPageNumbers, [getPageNumbers])

    const handlePageChange = useCallback(
      (newPage: number) => {
        if (!disabled && !isLoading && newPage !== page && newPage >= 1 && newPage <= totalPages) {
          onPageChange(newPage)
        }
      },
      [onPageChange, page, totalPages, isLoading, disabled]
    )

    return (
      <nav
        aria-label={ariaLabel}
        className="w-full flex flex-col items-center gap-2"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              key="pagination-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-red-500 text-sm font-medium"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="First page"
            aria-disabled={disabled || isLoading || page === 1}
            disabled={disabled || isLoading || page === 1}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handlePageChange(1)}
            className="px-2 py-1 rounded-md text-sm font-medium transition-colors
              bg-white border border-gray-300 hover:bg-gray-100
              disabled:opacity-50 disabled:pointer-events-none"
          >
            «
          </button>
          <button
            type="button"
            aria-label="Previous page"
            aria-disabled={disabled || isLoading || page === 1}
            disabled={disabled || isLoading || page === 1}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handlePageChange(page - 1)}
            className="px-2 py-1 rounded-md text-sm font-medium transition-colors
              bg-white border border-gray-300 hover:bg-gray-100
              disabled:opacity-50 disabled:pointer-events-none"
          >
            ‹
          </button>
          <AnimatePresence initial={false}>
            {pageNumbers.map((num) => (
              <motion.button
                key={num}
                type="button"
                aria-label={`Page ${num}`}
                aria-current={num === page ? 'page' : undefined}
                disabled={disabled || isLoading}
                tabIndex={disabled ? -1 : 0}
                onClick={() => handlePageChange(num)}
                className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors
                  ${
                    num === page
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }
                  disabled:opacity-50 disabled:pointer-events-none
                `}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {num}
              </motion.button>
            ))}
          </AnimatePresence>
          <button
            type="button"
            aria-label="Next page"
            aria-disabled={disabled || isLoading || page === totalPages}
            disabled={disabled || isLoading || page === totalPages}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handlePageChange(page + 1)}
            className="px-2 py-1 rounded-md text-sm font-medium transition-colors
              bg-white border border-gray-300 hover:bg-gray-100
              disabled:opacity-50 disabled:pointer-events-none"
          >
            ›
          </button>
          <button
            type="button"
            aria-label="Last page"
            aria-disabled={disabled || isLoading || page === totalPages}
            disabled={disabled || isLoading || page === totalPages}
            tabIndex={disabled ? -1 : 0}
            onClick={() => handlePageChange(totalPages)}
            className="px-2 py-1 rounded-md text-sm font-medium transition-colors
              bg-white border border-gray-300 hover:bg-gray-100
              disabled:opacity-50 disabled:pointer-events-none"
          >
            »
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <AnimatePresence>
            {isLoading ? (
              <motion.span
                key="pagination-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
                aria-live="polite"
              >
                <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
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
                </svg>
                Carregando...
              </motion.span>
            ) : (
              <motion.span
                key="pagination-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-live="polite"
              >
                Página {page} de {totalPages} — {total} itens
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </nav>
    )
  }
)
