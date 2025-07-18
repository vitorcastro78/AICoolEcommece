tsx
import React, { useEffect, useRef, useCallback, ReactNode, memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export interface EcommerceModalProps {
  /** Controls modal visibility */
  open: boolean
  /** Modal title */
  title?: string
  /** Modal content */
  children: ReactNode
  /** Loading state */
  loading?: boolean
  /** Error message */
  error?: string | null
  /** Called when modal requests close (backdrop or close button) */
  onClose: () => void
  /** Optional: aria-label for close button */
  closeLabel?: string
  /** Optional: disables closing on backdrop click/esc */
  disableClose?: boolean
  /** Optional: custom footer */
  footer?: ReactNode
  /** Optional: id for accessibility */
  id?: string
  /** Optional: className for modal container */
  className?: string
  /** Optional: max width (Tailwind max-w-*) */
  maxWidth?: string
}

/**
 * Responsive, accessible, animated modal for ecommerce subscriptions.
 */
export const EcommerceModal = memo(function EcommerceModal({
  open,
  title,
  children,
  loading,
  error,
  onClose,
  closeLabel = 'Close modal',
  disableClose = false,
  footer,
  id,
  className = '',
  maxWidth = 'max-w-lg',
}: EcommerceModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableClose) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, disableClose, onClose])

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus()
    }
  }, [open])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disableClose) return
      if (e.target === backdropRef.current) {
        onClose()
      }
    },
    [onClose, disableClose]
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-labelledby={id ? `${id}-title` : undefined}
          aria-describedby={id ? `${id}-desc` : undefined}
          onMouseDown={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          tabIndex={-1}
        >
          <motion.div
            ref={modalRef}
            className={`relative w-full ${maxWidth} mx-4 sm:mx-0 bg-white rounded-lg shadow-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all ${className}`}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            tabIndex={-1}
            aria-labelledby={id ? `${id}-title` : undefined}
            aria-describedby={id ? `${id}-desc` : undefined}
          >
            <button
              type="button"
              aria-label={closeLabel}
              onClick={disableClose ? undefined : onClose}
              disabled={disableClose}
              className="absolute top-3 right-3 rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              tabIndex={0}
            >
              <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden="true" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </button>
            {title && (
              <h2
                id={id ? `${id}-title` : undefined}
                className="text-lg sm:text-xl font-semibold text-gray-900 px-6 pt-6 pb-2"
              >
                {title}
              </h2>
            )}
            <div
              id={id ? `${id}-desc` : undefined}
              className="px-6 pb-6 pt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 mb-4" role="alert">
                  <span className="font-medium">Error:</span> {error}
                </div>
              ) : (
                children
              )}
            </div>
            {footer && (
              <div className="px-6 pb-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
