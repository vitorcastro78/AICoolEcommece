tsx
import React, { useMemo, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSubscriptionPreview } from '../hooks/useSubscriptionPreview'
import { useProducts } from '../hooks/useProducts'
import { useCreateSubscription } from '../hooks/useSubscriptions'
import type { GetProductListResponse } from '../api/productsApiService'
import type { SubscriptionPreviewResponse } from '../api/types'

export interface ShoppingCartItem {
  product: GetProductListResponse
  ratePlanId: string
  quantity: number
}

export interface ShoppingCartProps {
  open: boolean
  onClose: () => void
  items: ShoppingCartItem[]
  onUpdateQuantity: (productId: string, ratePlanId: string, quantity: number) => void
  onRemove: (productId: string, ratePlanId: string) => void
  promoCode?: string
  onPromoCodeChange?: (code: string) => void
  currency?: string
  checkoutButtonLabel?: string
  onCheckoutSuccess?: (subscription: any) => void
  onCheckoutError?: (error: any) => void
  isLoading?: boolean
  isDisabled?: boolean
  ariaLabel?: string
}

/**
 * ShoppingCart component for subscription ecommerce.
 */
export const ShoppingCart: React.FC<ShoppingCartProps> = React.memo(
  ({
    open,
    onClose,
    items,
    onUpdateQuantity,
    onRemove,
    promoCode,
    onPromoCodeChange,
    currency,
    checkoutButtonLabel = 'Checkout',
    onCheckoutSuccess,
    onCheckoutError,
    isLoading: externalLoading,
    isDisabled,
    ariaLabel = 'Shopping cart',
  }) => {
    const [localPromo, setLocalPromo] = useState(promoCode ?? '')
    const [checkoutClicked, setCheckoutClicked] = useState(false)

    const productIds = useMemo(
      () => items.map((item) => item.ratePlanId),
      [items]
    )

    const { mutateAsync: previewSubscription, isLoading: isPreviewLoading, error: previewError, data: previewData } =
      useSubscriptionPreview()

    const { mutateAsync: createSubscription, isLoading: isCheckoutLoading, error: checkoutError } =
      useCreateSubscription()

    const [preview, setPreview] = useState<SubscriptionPreviewResponse | null>(null)
    const [previewing, setPreviewing] = useState(false)
    const [previewErr, setPreviewErr] = useState<any>(null)

    React.useEffect(() => {
      let ignore = false
      if (items.length === 0) {
        setPreview(null)
        setPreviewErr(null)
        return
      }
      setPreviewing(true)
      setPreviewErr(null)
      previewSubscription(
        {
          data: {
            products: productIds,
            promoCode: localPromo || undefined,
          },
        },
        {
          onSuccess: (data) => {
            if (!ignore) {
              setPreview(data)
              setPreviewing(false)
            }
          },
          onError: (err) => {
            if (!ignore) {
              setPreview(null)
              setPreviewErr(err)
              setPreviewing(false)
            }
          },
        }
      )
      return () => {
        ignore = true
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productIds.join(','), localPromo])

    const handleQuantityChange = useCallback(
      (productId: string, ratePlanId: string, quantity: number) => {
        if (quantity < 1) return
        onUpdateQuantity(productId, ratePlanId, quantity)
      },
      [onUpdateQuantity]
    )

    const handleRemove = useCallback(
      (productId: string, ratePlanId: string) => {
        onRemove(productId, ratePlanId)
      },
      [onRemove]
    )

    const handlePromoChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalPromo(e.target.value)
        onPromoCodeChange?.(e.target.value)
      },
      [onPromoCodeChange]
    )

    const handleCheckout = useCallback(async () => {
      if (isDisabled || items.length === 0) return
      setCheckoutClicked(true)
      try {
        const result = await createSubscription({
          products: productIds,
          promoCode: localPromo || undefined,
        })
        onCheckoutSuccess?.(result)
        setCheckoutClicked(false)
        onClose()
      } catch (err) {
        onCheckoutError?.(err)
        setCheckoutClicked(false)
      }
    }, [
      createSubscription,
      items.length,
      isDisabled,
      localPromo,
      onCheckoutError,
      onCheckoutSuccess,
      onClose,
      productIds,
    ])

    const total = useMemo(() => preview?.totalPrice ?? 0, [preview])
    const cartCurrency = currency || preview?.currency || (items[0]?.product?.ratePlans?.[0]?.currency ?? 'USD')

    const isCartLoading = externalLoading || isPreviewLoading || previewing || isCheckoutLoading

    return (
      <AnimatePresence>
        {open && (
          <motion.aside
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-label={ariaLabel}
          >
            <motion.div
              className="w-full sm:w-[420px] max-w-full bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-y-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              tabIndex={-1}
            >
              <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold" id="cart-title">
                  Shopping Cart
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close cart"
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  type="button"
                >
                  <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              <div className="flex-1 px-6 py-4 overflow-y-auto" aria-labelledby="cart-title">
                {isCartLoading && (
                  <div className="flex justify-center items-center py-8">
                    <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
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
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  </div>
                )}
                {!isCartLoading && items.length === 0 && (
                  <div className="text-center text-gray-500 py-12" role="status">
                    Your cart is empty.
                  </div>
                )}
                {!isCartLoading && items.length > 0 && (
                  <ul className="space-y-6" aria-live="polite">
                    {items.map((item) => (
                      <li
                        key={item.product.id + '-' + item.ratePlanId}
                        className="flex items-center gap-4"
                        aria-label={`Cart item: ${item.product.name}`}
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.product.name}</div>
                          <div className="text-xs text-gray-500 truncate">{item.product.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <label htmlFor={`quantity-${item.product.id}-${item.ratePlanId}`} className="sr-only">
                              Quantity
                            </label>
                            <input
                              id={`quantity-${item.product.id}-${item.ratePlanId}`}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.product.id,
                                  item.ratePlanId,
                                  Math.max(1, Number(e.target.value))
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              aria-label="Quantity"
                              disabled={isCartLoading}
                            />
                            <button
                              type="button"
                              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              aria-label={`Remove ${item.product.name}`}
                              onClick={() => handleRemove(item.product.id, item.ratePlanId)}
                              disabled={isCartLoading}
                            >
                              <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="ml-2 text-right min-w-[60px]">
                          <span className="font-semibold">
                            {cartCurrency}{' '}
                            {preview?.ratePlans
                              ?.find((rp) => rp.id === item.ratePlanId)
                              ?.charges?.[0]?.pricing?.price
                              ? (
                                  preview.ratePlans.find((rp) => rp.id === item.ratePlanId)?.charges?.[0]?.pricing
                                    ?.price * item.quantity
                                ).toLocaleString(undefined, {
                                  style: 'currency',
                                  currency: cartCurrency,
                                  minimumFractionDigits: 2,
                                })
                              : '--'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {!isCartLoading && items.length > 0 && (
                  <form
                    className="mt-6 flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      onPromoCodeChange?.(localPromo)
                    }}
                  >
                    <label htmlFor="promo" className="sr-only">
                      Promo code
                    </label>
                    <input
                      id="promo"
                      type="text"
                      value={localPromo}
                      onChange={handlePromoChange}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isCartLoading}
                      aria-label="Promo code"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      disabled={isCartLoading}
                      aria-label="Apply promo code"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {previewErr && (
                  <div className="mt-4 text-sm text-red-600" role="alert">
                    {typeof previewErr === 'string'
                      ? previewErr
                      : previewErr?.detail || 'Failed to preview subscription.'}
                  </div>
                )}
                {previewError && (
                  <div className="mt-4 text-sm text-red-600" role="alert">
                    {typeof previewError === 'string'
                      ? previewError
                      : previewError?.detail || 'Failed to preview subscription.'}
                  </div>
                )}
              </div>
              <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-lg font-bold" aria-live="polite">
                      {cartCurrency}{' '}
                      {typeof total === 'number'
                        ? total.toLocaleString(undefined, {
                            style: 'currency',
                            currency: cartCurrency,
                            minimumFractionDigits: 2,
                          })
                        : '--'}
                    </span>
                  </div>
                  {preview?.discountAmount ? (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        -{cartCurrency}{' '}
                        {preview.discountAmount.toLocaleString(undefined, {
                          style: 'currency',
                          currency: cartCurrency,
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="mt-4 w-full py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleCheckout}
                    disabled={isCartLoading || isDisabled || items.length === 0}
                    aria-disabled={isCartLoading || isDisabled || items.length === 0}
                    aria-busy={isCartLoading || checkoutClicked}
                  >
                    {isCartLoading || checkoutClicked ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      checkoutButtonLabel
                    )}
                  </button>
                  {checkoutError && (
                    <div className="mt-2 text-sm text-red-600" role="alert">
                      {typeof checkoutError === 'string'
                        ? checkoutError
                        : checkoutError?.detail || 'Checkout failed.'}
                    </div>
                  )}
                </div>
              </footer>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    )
  }
)
