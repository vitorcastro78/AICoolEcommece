tsx
import React, { useEffect, useCallback, useRef, memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export interface NotificationProps {
  open: boolean
  type?: NotificationType
  title?: string
  message: string
  loading?: boolean
  error?: string
  duration?: number
  onClose?: () => void
  actions?: NotificationAction[]
  className?: string
  id?: string
}

/**
 * Notification component for ecommerce subscriptions.
 */
export const Notification: React.FC<NotificationProps> = memo(
  ({
    open,
    type = 'info',
    title,
    message,
    loading = false,
    error,
    duration = 5000,
    onClose,
    actions,
    className,
    id,
  }) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const notificationId = id || 'notification'

    const handleClose = useCallback(() => {
      if (onClose) onClose()
    }, [onClose])

    useEffect(() => {
      if (open && !loading && !error && duration > 0) {
        timerRef.current = setTimeout(handleClose, duration)
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current)
        }
      }
      return
    }, [open, loading, error, duration, handleClose])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') handleClose()
      },
      [handleClose]
    )

    const getTypeIcon = () => {
      if (loading)
        return (
          <svg className="animate-spin h-6 w-6 text-blue-500" aria-hidden="true" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )
      if (type === 'success')
        return (
          <svg className="h-6 w-6 text-green-500" aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" className="opacity-10" />
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
          </svg>
        )
      if (type === 'error')
        return (
          <svg className="h-6 w-6 text-red-500" aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" className="opacity-10" />
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
          </svg>
        )
      if (type === 'warning')
        return (
          <svg className="h-6 w-6 text-yellow-500" aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="currentColor" className="opacity-10" />
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
        )
      return (
        <svg className="h-6 w-6 text-blue-500" aria-hidden="true" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" className="opacity-10" />
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 16h.01M12 8v4" />
        </svg>
      )
    }

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            key="notification"
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            tabIndex={0}
            role="status"
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            aria-labelledby={title ? `${notificationId}-title` : undefined}
            aria-describedby={`${notificationId}-desc`}
            onKeyDown={handleKeyDown}
            className={`fixed z-50 inset-x-0 mx-auto bottom-4 max-w-sm w-full shadow-lg rounded-lg flex items-start gap-3 px-4 py-4 bg-white dark:bg-gray-900 border ${
              type === 'success'
                ? 'border-green-200 dark:border-green-700'
                : type === 'error'
                ? 'border-red-200 dark:border-red-700'
                : type === 'warning'
                ? 'border-yellow-200 dark:border-yellow-700'
                : 'border-blue-200 dark:border-blue-700'
            } ${className ?? ''} transition-all`}
            id={notificationId}
            data-testid="notification"
          >
            <div className="flex-shrink-0 mt-1">{getTypeIcon()}</div>
            <div className="flex-1 min-w-0">
              {title && (
                <div
                  id={`${notificationId}-title`}
                  className="font-semibold text-gray-900 dark:text-white text-base mb-1"
                >
                  {title}
                </div>
              )}
              <div
                id={`${notificationId}-desc`}
                className="text-sm text-gray-700 dark:text-gray-200"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span>Loading...</span>
                  </span>
                ) : error ? (
                  <span className="text-red-600 dark:text-red-400">{error}</span>
                ) : (
                  message
                )}
              </div>
              {actions && actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {actions.map((action, idx) => (
                    <button
                      key={action.label + idx}
                      type="button"
                      className={`px-3 py-1.5 rounded text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition ${
                        action.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-gray-400'
                      }`}
                      onClick={action.onClick}
                      aria-label={action.label}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              aria-label="Close notification"
              className="ml-2 mt-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              onClick={handleClose}
              tabIndex={0}
            >
              <svg className="h-5 w-5 text-gray-400" aria-hidden="true" viewBox="0 0 20 20" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l8 8M6 14L14 6"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)
