tsx
import React, { memo, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface BreadcrumbItem {
  label: string
  href?: string
  loading?: boolean
  error?: string
  icon?: React.ReactNode
  'aria-current'?: 'page' | undefined
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  onNavigate?: (href: string, index: number) => void
}

const separatorDefault = (
  <svg
    className="w-4 h-4 mx-2 text-gray-400"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const loadingDotVariants = {
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
  },
}

const Breadcrumb = memo(function Breadcrumb({
  items,
  separator = separatorDefault,
  className = '',
  onNavigate,
}: BreadcrumbProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent, href: string | undefined, idx: number, loading?: boolean, error?: string) => {
      if (!href || loading || error) {
        e.preventDefault()
        return
      }
      if (onNavigate) onNavigate(href, idx)
    },
    [onNavigate]
  )

  const renderedItems = useMemo(
    () =>
      items.map((item, idx) => {
        const isLast = idx === items.length - 1
        const isLoading = !!item.loading
        const isError = !!item.error
        const ariaCurrent = isLast ? 'page' : undefined
        return (
          <li
            key={idx}
            className="flex items-center min-w-0"
            aria-current={ariaCurrent}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.span
                  className="flex items-center gap-1 text-gray-400 min-w-[2.5rem]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  aria-label="Loading"
                  role="status"
                >
                  <span className="sr-only">Loading</span>
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-gray-400"
                    variants={loadingDotVariants}
                    animate="animate"
                  />
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-gray-400"
                    variants={loadingDotVariants}
                    animate="animate"
                    transition={{ delay: 0.3 }}
                  />
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-gray-400"
                    variants={loadingDotVariants}
                    animate="animate"
                    transition={{ delay: 0.6 }}
                  />
                </motion.span>
              ) : isError ? (
                <motion.span
                  className="flex items-center gap-1 text-red-500 font-medium min-w-[2.5rem]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  aria-label="Error"
                  role="alert"
                  tabIndex={0}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  {item.error}
                </motion.span>
              ) : item.href && !isLast ? (
                <motion.a
                  href={item.href}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 min-w-[2.5rem]"
                  tabIndex={0}
                  aria-current={item['aria-current']}
                  onClick={e => handleClick(e, item.href, idx, isLoading, item.error)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  aria-disabled={isLoading || isError}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </motion.a>
              ) : (
                <motion.span
                  className="flex items-center gap-1 text-sm text-gray-900 font-semibold min-w-[2.5rem]"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  aria-current="page"
                  tabIndex={0}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span className="truncate">{item.label}</span>
                </motion.span>
              )}
            </AnimatePresence>
            {!isLast && (
              <span
                className="flex-shrink-0"
                aria-hidden="true"
              >
                {separator}
              </span>
            )}
          </li>
        )
      }),
    [items, handleClick, separator]
  )

  return (
    <nav
      className={`w-full py-2 px-2 md:px-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm flex items-center overflow-x-auto ${className}`}
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="flex flex-nowrap items-center w-full space-x-0 md:space-x-1 text-xs md:text-sm overflow-x-auto" role="list">
        {renderedItems}
      </ol>
    </nav>
  )
})

export default Breadcrumb
