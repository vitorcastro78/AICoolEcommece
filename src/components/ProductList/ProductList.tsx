tsx
import React, { useMemo, useCallback } from 'react'
import { useProducts } from '../hooks/useProducts'
import type { GetProductListResponse } from '../api/productsApiService'
import { motion, AnimatePresence } from 'framer-motion'

export interface ProductListProps {
  page?: number
  pageSize?: number
  onProductSelect?: (product: GetProductListResponse) => void
  showDescription?: boolean
  showRatePlans?: boolean
  className?: string
  style?: React.CSSProperties
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06 }
  })
}

const ProductList: React.FC<ProductListProps> = React.memo(
  ({
    page = 1,
    pageSize = 12,
    onProductSelect,
    showDescription = true,
    showRatePlans = true,
    className,
    style
  }) => {
    const { data, isLoading, isError, error, refetch } = useProducts({ page, pageSize })

    const products = useMemo(() => data?.entries ?? [], [data])
    const total = data?.total ?? 0

    const handleProductClick = useCallback(
      (product: GetProductListResponse) => {
        if (onProductSelect) onProductSelect(product)
      },
      [onProductSelect]
    )

    if (isLoading) {
      return (
        <div
          className="flex justify-center items-center min-h-[200px]"
          role="status"
          aria-live="polite"
        >
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )
    }

    if (isError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[200px] text-red-600"
          role="alert"
          aria-live="assertive"
        >
          <span className="font-semibold text-lg mb-2">Failed to load products.</span>
          <span className="text-sm">{(error as any)?.detail || 'An error occurred.'}</span>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => refetch()}
            aria-label="Retry loading products"
          >
            Retry
          </button>
        </div>
      )
    }

    if (!products.length) {
      return (
        <div
          className="flex items-center justify-center min-h-[200px] text-gray-500"
          role="status"
          aria-live="polite"
        >
          <span>No products found.</span>
        </div>
      )
    }

    return (
      <section
        className={`w-full ${className ?? ''}`}
        style={style}
        aria-label="Product List"
      >
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          role="list"
        >
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.li
                key={product.id}
                custom={i}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={cardVariants}
                layout
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 flex flex-col cursor-pointer focus-within:ring-2 focus-within:ring-primary"
                tabIndex={0}
                aria-label={`Product: ${product.name}`}
                onClick={() => handleProductClick(product)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleProductClick(product)
                  }
                }}
              >
                <div className="relative w-full aspect-w-16 aspect-h-10 bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={product.name}>
                    {product.name}
                  </h2>
                  <span className="text-xs text-gray-500 mb-2" aria-label={`SKU: ${product.sku}`}>
                    {product.sku}
                  </span>
                  {showDescription && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3" title={product.description}>
                      {product.description}
                    </p>
                  )}
                  {showRatePlans && Array.isArray(product.ratePlans) && product.ratePlans.length > 0 && (
                    <div className="mt-auto">
                      <ul className="space-y-1">
                        {product.ratePlans.map((plan: any, idx: number) => (
                          <li key={plan.id || idx} className="flex items-center text-xs text-gray-600">
                            <span className="font-medium">{plan.name || 'Subscription'}</span>
                            {typeof plan.totalPrice === 'number' && plan.totalPrice > 0 && (
                              <span className="ml-2 text-primary font-semibold">
                                {plan.totalPrice.toLocaleString(undefined, {
                                  style: 'currency',
                                  currency: plan.currency || 'USD'
                                })}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4">
                  <button
                    className="w-full py-2 mt-2 bg-primary text-white rounded hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary transition"
                    tabIndex={-1}
                    aria-label={`Select ${product.name}`}
                    onClick={e => {
                      e.stopPropagation()
                      handleProductClick(product)
                    }}
                  >
                    Select
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {total > pageSize && (
          <nav
            className="flex justify-center mt-8"
            aria-label="Pagination"
          >
            {/* Pagination controls can be implemented here */}
          </nav>
        )}
      </section>
    )
  }
)

export default ProductList

