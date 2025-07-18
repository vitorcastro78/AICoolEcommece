tsx
import React, { memo, useCallback } from 'react'
import { useProduct } from '../hooks/useProduct'
import { motion, AnimatePresence } from 'framer-motion'

export interface ProductDetailsProps {
  /** Product ID to fetch and display */
  productId: string
  /** Called when user clicks "Subscribe" */
  onSubscribe?: (productId: string, ratePlanId?: string) => void
  /** Optional: Custom className */
  className?: string
}

/**
 * Displays details for a subscription product.
 */
export const ProductDetails: React.FC<ProductDetailsProps> = memo(
  ({ productId, onSubscribe, className }) => {
    const {
      product,
      isLoading,
      isError,
      error,
      refetch,
    } = useProduct(productId)

    const handleSubscribe = useCallback(
      (ratePlanId?: string) => {
        if (onSubscribe && product) {
          onSubscribe(product.id, ratePlanId)
        }
      },
      [onSubscribe, product]
    )

    return (
      <section
        className={`w-full max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg flex flex-col md:flex-row gap-8 ${className ?? ''}`}
        aria-labelledby="product-details-title"
        aria-busy={isLoading}
        aria-live="polite"
        tabIndex={-1}
      >
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              className="flex flex-1 items-center justify-center min-h-[300px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Loading product details"
              role="status"
            >
              <svg
                className="animate-spin h-10 w-10 text-gray-400"
                viewBox="0 0 24 24"
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
              </svg>
            </motion.div>
          )}

          {isError && (
            <motion.div
              key="error"
              className="flex flex-1 flex-col items-center justify-center text-red-600 min-h-[300px]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              role="alert"
              aria-live="assertive"
            >
              <span className="text-lg font-semibold mb-2">Failed to load product</span>
              <span className="text-sm">{(error as any)?.detail || 'An error occurred.'}</span>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Retry loading product"
              >
                Retry
              </button>
            </motion.div>
          )}

          {!isLoading && !isError && product && (
            <motion.div
              key="content"
              className="flex flex-col md:flex-row w-full gap-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              aria-labelledby="product-details-title"
            >
              <div className="flex-shrink-0 flex justify-center items-start md:items-center w-full md:w-1/2">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="rounded-lg object-cover w-full max-w-xs h-56 md:h-72 shadow-md"
                  loading="lazy"
                  aria-hidden={product.imageUrl ? undefined : 'true'}
                />
              </div>
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <h1
                  id="product-details-title"
                  className="text-2xl md:text-3xl font-bold text-gray-900"
                >
                  {product.name}
                </h1>
                <span className="text-sm text-gray-500" aria-label="SKU">
                  SKU: {product.sku}
                </span>
                <p className="text-gray-700 text-base md:text-lg" aria-label="Product description">
                  {product.description}
                </p>
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Subscription Plans</h2>
                  <ul className="flex flex-col gap-3">
                    {Array.isArray(product.ratePlans) && product.ratePlans.length > 0 ? (
                      product.ratePlans.map((plan: any) => (
                        <li
                          key={plan.id ?? plan.name}
                          className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 rounded p-3"
                        >
                          <div>
                            <span className="font-medium text-gray-900">{plan.name}</span>
                            {plan.description && (
                              <span className="block text-gray-500 text-sm">{plan.description}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 md:mt-0">
                            {typeof plan.totalPrice === 'number' && plan.totalPrice > 0 && (
                              <span className="text-blue-700 font-semibold text-lg" aria-label="Price">
                                {plan.totalPrice.toLocaleString(undefined, {
                                  style: 'currency',
                                  currency: plan.currency || 'USD',
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            )}
                            <button
                              type="button"
                              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                              aria-label={`Subscribe to ${plan.name}`}
                              onClick={() => handleSubscribe(plan.id)}
                            >
                              Subscribe
                            </button>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No subscription plans available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    )
  }
)

ProductDetails.displayName = 'ProductDetails'
