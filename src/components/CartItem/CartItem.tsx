tsx
import React, { memo, useCallback } from 'react'
import { motion } from 'framer-motion'

export interface CartItemProduct {
  id: string
  name: string
  description?: string
  imageUrl?: string
  sku?: string
  ratePlanName?: string
}

export interface CartItemProps {
  product: CartItemProduct
  quantity: number
  price: number
  currency: string
  isLoading?: boolean
  error?: string | null
  onQuantityChange?: (newQuantity: number) => void
  onRemove?: () => void
  minQuantity?: number
  maxQuantity?: number
  disableActions?: boolean
}

/**
 * CartItem component for subscription ecommerce.
 */
export const CartItem: React.FC<CartItemProps> = memo(
  ({
    product,
    quantity,
    price,
    currency,
    isLoading = false,
    error = null,
    onQuantityChange,
    onRemove,
    minQuantity = 1,
    maxQuantity = 99,
    disableActions = false,
  }) => {
    const handleDecrease = useCallback(() => {
      if (onQuantityChange && quantity > minQuantity) {
        onQuantityChange(quantity - 1)
      }
    }, [onQuantityChange, quantity, minQuantity])

    const handleIncrease = useCallback(() => {
      if (onQuantityChange && quantity < maxQuantity) {
        onQuantityChange(quantity + 1)
      }
    }, [onQuantityChange, quantity, maxQuantity])

    const handleRemove = useCallback(() => {
      if (onRemove) onRemove()
    }, [onRemove])

    return (
      <motion.li
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col sm:flex-row items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-800"
        aria-busy={isLoading}
        aria-live="polite"
        aria-label={`Cart item: ${product.name}`}
        tabIndex={0}
      >
        <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain w-full h-full"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="text-gray-400 text-2xl" aria-hidden>
              <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
                <rect width="40" height="40" rx="8" fill="currentColor" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 w-full flex flex-col gap-1">
          <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate" title={product.name}>
            {product.name}
          </span>
          {product.ratePlanName && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{product.ratePlanName}</span>
          )}
          {product.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</span>
          )}
          {product.sku && (
            <span className="text-xs text-gray-400 dark:text-gray-600">SKU: {product.sku}</span>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <div className="flex items-center gap-2" aria-label="Quantity controls">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isLoading || disableActions || quantity <= minQuantity}
              onClick={handleDecrease}
              className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              tabIndex={0}
            >
              <span aria-hidden>-</span>
            </button>
            <span
              className="w-8 text-center text-base font-medium text-gray-900 dark:text-gray-100"
              aria-live="polite"
              aria-atomic="true"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
              ) : (
                quantity
              )}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isLoading || disableActions || quantity >= maxQuantity}
              onClick={handleIncrease}
              className="w-8 h-8 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
              tabIndex={0}
            >
              <span aria-hidden>+</span>
            </button>
          </div>
          <button
            type="button"
            aria-label="Remove item"
            disabled={isLoading || disableActions}
            onClick={handleRemove}
            className="text-xs text-red-600 dark:text-red-400 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 transition disabled:opacity-50"
            tabIndex={0}
          >
            Remove
          </button>
        </div>
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="font-semibold text-base text-gray-900 dark:text-gray-100" aria-label="Item price">
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" aria-label="Loading" />
            ) : (
              <>
                {currency} {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </>
            )}
          </span>
        </div>
        {error && (
          <div className="w-full mt-2 text-xs text-red-600 dark:text-red-400" role="alert" aria-live="assertive">
            {error}
          </div>
        )}
      </motion.li>
    )
  }
)
