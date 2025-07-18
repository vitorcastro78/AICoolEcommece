tsx
import React, { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useProduct } from '../hooks/useProduct'
import type { GetProductResponse } from '../api/productsService'

export interface ProductCardProps {
  /** Product id */
  productId: string
  /** Called when user clicks "Subscribe" */
  onSubscribe?: (product: GetProductResponse) => void
  /** Optional: show skeleton loader instead of card */
  loading?: boolean
  /** Optional: override product data (for SSR or optimistic UI) */
  productOverride?: GetProductResponse
  /** Optional: className for outer container */
  className?: string
  /** Optional: aria-label for the card */
  ariaLabel?: string
}

/**
 * ProductCard component for subscription ecommerce.
 */
export const ProductCard = memo(function ProductCard({
  productId,
  onSubscribe,
  loading: loadingProp,
  productOverride,
  className = '',
  ariaLabel,
}: ProductCardProps) {
  const {
    product,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(productId, { enabled: !productOverride })

  const isLoadingFinal = loadingProp ?? isLoading
  const prod = productOverride ?? product

  const handleSubscribe = useCallback(() => {
    if (prod && onSubscribe) onSubscribe(prod)
  }, [prod, onSubscribe])

  if (isLoadingFinal) {
    return (
      <div
        className={`w-full max-w-xs rounded-xl shadow-md bg-white dark:bg-gray-900 p-4 animate-pulse flex flex-col items-center ${className}`}
        aria-busy="true"
        aria-label={ariaLabel || 'Loading product'}
        tabIndex={-1}
      >
        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    )
  }

  if (isError || !prod) {
    return (
      <div
        className={`w-full max-w-xs rounded-xl shadow-md bg-white dark:bg-gray-900 p-4 flex flex-col items-center ${className}`}
        role="alert"
        aria-label={ariaLabel || 'Product load error'}
        tabIndex={0}
      >
        <span className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load product</span>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Retry loading product"
        >
          Retry
        </button>
      </div>
    )
  }

  const { name, description, imageUrl, ratePlans } = prod
  const priceInfo = Array.isArray(ratePlans) && ratePlans.length > 0
    ? ratePlans[0]
    : undefined
  const price =
    typeof priceInfo?.totalPrice === 'number'
      ? priceInfo.totalPrice
      : undefined
  const currency =
    typeof priceInfo?.currency === 'string'
      ? priceInfo.currency
      : undefined
  const billingPeriod =
    typeof priceInfo?.billingPeriod === 'string'
      ? priceInfo.billingPeriod
      : undefined

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className={`w-full max-w-xs rounded-xl shadow-md bg-white dark:bg-gray-900 p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-200 ${className}`}
      aria-label={ariaLabel || `Product: ${name}`}
      tabIndex={0}
      role="region"
    >
      <div className="w-full flex justify-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-32 h-32 object-contain rounded-lg mb-4 bg-gray-100 dark:bg-gray-800"
          loading="lazy"
          draggable={false}
        />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center truncate w-full" title={name}>
        {name}
      </h2>
      <div className="text-sm text-gray-500 dark:text-gray-300 mb-3 text-center line-clamp-2 w-full" title={description}>
        {description}
      </div>
      <div className="flex items-center justify-center mb-4 w-full">
        {typeof price === 'number' && currency ? (
          <span className="text-xl font-bold text-gray-900 dark:text-white" aria-label={`Price: ${price} ${currency}`}>
            {new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency,
              maximumFractionDigits: 2,
            }).format(price)}
            {billingPeriod ? (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                /{billingPeriod.toLowerCase()}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-base">Contact us</span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubscribe}
        className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors duration-150"
        aria-label={`Subscribe to ${name}`}
        tabIndex={0}
      >
        Subscribe
      </button>
    </motion.article>
  )
})

