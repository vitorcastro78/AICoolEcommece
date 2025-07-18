tsx
import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscriptionPreview } from '../hooks/useSubscriptionPreview'
import type { PostSubscriptionPreviewRequest, SubscriptionPreviewResponse } from '../api/types'

export interface SubscriptionsSummaryProps {
  /**
   * Products to preview in the subscription summary.
   */
  products: string[]
  /**
   * Optional promo code to apply.
   */
  promoCode?: string
  /**
   * Optional: override currency display (default: from API).
   */
  currency?: string
  /**
   * Optional: custom className for container.
   */
  className?: string
  /**
   * Optional: callback when error occurs.
   */
  onError?: (error: unknown) => void
  /**
   * Optional: callback when preview is loaded.
   */
  onLoaded?: (data: SubscriptionPreviewResponse) => void
}

/**
 * SubscriptionsSummary displays a summary of the user's subscription cart,
 * including products, pricing, discounts, and totals.
 */
export const SubscriptionsSummary: React.FC<SubscriptionsSummaryProps> = React.memo(
  ({ products, promoCode, currency: currencyOverride, className = '', onError, onLoaded }) => {
    const { preview, isLoading, isError, error, data, reset } = useSubscriptionPreview()

    React.useEffect(() => {
      if (products.length > 0) {
        preview({ data: { products, promoCode } })
      }
    }, [products, promoCode, preview])

    React.useEffect(() => {
      if (isError && onError) onError(error)
    }, [isError, error, onError])

    React.useEffect(() => {
      if (data && onLoaded) onLoaded(data)
    }, [data, onLoaded])

    const summary = useMemo(() => {
      if (!data) return null
      const { ratePlans, totalPrice, currency, discountAmount, discountPercentage, promoCode: appliedPromo } = data
      return {
        ratePlans,
        totalPrice,
        currency: currencyOverride || currency,
        discountAmount,
        discountPercentage,
        appliedPromo,
      }
    }, [data, currencyOverride])

    return (
      <section
        className={`w-full max-w-lg mx-auto rounded-lg shadow-lg bg-white dark:bg-gray-900 p-6 md:p-8 transition-colors duration-200 ${className}`}
        aria-label="Subscription summary"
        tabIndex={-1}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center min-h-[180px]"
              aria-busy="true"
              aria-live="polite"
            >
              <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24" aria-hidden="true">
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
              <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Calculando resumo...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center justify-center min-h-[180px]"
              role="alert"
              aria-live="assertive"
            >
              <span className="text-red-600 dark:text-red-400 font-semibold text-base mb-2">
                Erro ao calcular o resumo
              </span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">
                {typeof error === 'object' && error && 'detail' in error
                  ? (error as any).detail
                  : 'Ocorreu um erro inesperado.'}
              </span>
              <button
                type="button"
                className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => {
                  reset()
                  preview({ data: { products, promoCode } })
                }}
              >
                Tentar novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!isLoading && !isError && summary && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col gap-4"
              aria-live="polite"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2" id="summary-title">
                Resumo da Assinatura
              </h2>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700" aria-labelledby="summary-title">
                {summary.ratePlans.map((plan: any) => (
                  <li key={plan.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="block text-base font-medium text-gray-800 dark:text-gray-100">{plan.name}</span>
                      {plan.charges && Array.isArray(plan.charges) && (
                        <ul className="ml-2 mt-1 space-y-1">
                          {plan.charges.map((charge: any) => (
                            <li key={charge.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <span className="mr-2">{charge.name}</span>
                              <span className="mx-1">x{charge.quantity}</span>
                              <span className="ml-2 text-xs text-gray-400">
                                {charge.billingPeriod}
                              </span>
                              {charge.discountAmount > 0 && (
                                <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                                  -{charge.discountAmount.toLocaleString(undefined, {
                                    style: 'currency',
                                    currency: summary.currency,
                                  })}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="block text-base font-semibold text-gray-900 dark:text-white">
                        {plan.charges && Array.isArray(plan.charges)
                          ? plan.charges
                              .reduce(
                                (sum: number, c: any) =>
                                  sum +
                                  ((c.pricing && typeof c.pricing.price === 'number'
                                    ? c.pricing.price
                                    : 0) *
                                    (c.quantity || 1) -
                                    (c.discountAmount || 0)),
                                0
                              )
                              .toLocaleString(undefined, {
                                style: 'currency',
                                currency: summary.currency,
                              })
                          : ''}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 mt-4">
                {summary.discountAmount && summary.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Desconto{summary.appliedPromo ? ` (${summary.appliedPromo})` : ''}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      -{summary.discountAmount.toLocaleString(undefined, {
                        style: 'currency',
                        currency: summary.currency,
                      })}
                      {summary.discountPercentage && summary.discountPercentage > 0
                        ? ` (${summary.discountPercentage}% off)`
                        : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-lg mt-2">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {summary.totalPrice.toLocaleString(undefined, {
                      style: 'currency',
                      currency: summary.currency,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    )
  }
)
SubscriptionsSummary.displayName = 'SubscriptionsSummary'

