tsx
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountries } from '../hooks/useCountries'
import { useCreatePaymentMethod } from '../hooks/usePaymentMethod'
import type { CreatePaymentMethodRequest } from '../api/CreatePaymentMethodRequest'
import type { ProblemDetails } from '../api/ProblemDetails'

export interface PaymentFormProps {
  invoiceId: string
  onSuccess?: () => void
  onError?: (error: ProblemDetails) => void
  onCancel?: () => void
  className?: string
  showBillingAddress?: boolean
  supportedCardTypes?: string[]
}

const initialCard: CreatePaymentMethodRequest = {
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  name: '',
  securityCode: '',
  type: 'CreditCard',
  recurringPaymentMethod: true,
}

/**
 * PaymentForm component for subscription ecommerce checkout.
 */
export const PaymentForm: React.FC<PaymentFormProps> = React.memo(
  ({
    invoiceId,
    onSuccess,
    onError,
    onCancel,
    className = '',
    showBillingAddress = true,
    supportedCardTypes = ['Visa', 'MasterCard', 'Amex'],
  }) => {
    const [card, setCard] = useState<CreatePaymentMethodRequest>(initialCard)
    const [billing, setBilling] = useState({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      countryCode: '',
    })
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [showAddress, setShowAddress] = useState(showBillingAddress)
    const [formError, setFormError] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const formRef = useRef<HTMLFormElement>(null)

    const { countries, isLoading: countriesLoading } = useCountries()
    const createPaymentMethod = useCreatePaymentMethod()

    const isCardNumberValid = useMemo(
      () =>
        /^[0-9]{13,19}$/.test(card.cardNumber.replace(/\s/g, '')) &&
        luhnCheck(card.cardNumber.replace(/\s/g, '')),
      [card.cardNumber]
    )
    const isExpiryMonthValid = useMemo(
      () => /^(0[1-9]|1[0-2])$/.test(card.expiryMonth),
      [card.expiryMonth]
    )
    const isExpiryYearValid = useMemo(() => {
      const year = Number(card.expiryYear)
      const now = new Date()
      return (
        /^\d{4}$/.test(card.expiryYear) &&
        year >= now.getFullYear() &&
        year <= now.getFullYear() + 20
      )
    }, [card.expiryYear])
    const isNameValid = useMemo(() => card.name.trim().length > 1, [card.name])
    const isSecurityCodeValid = useMemo(
      () => /^[0-9]{3,4}$/.test(card.securityCode),
      [card.securityCode]
    )
    const isCountryValid = useMemo(
      () => !showAddress || !!billing.countryCode,
      [showAddress, billing.countryCode]
    )
    const isAddressValid = useMemo(
      () =>
        !showAddress ||
        (billing.addressLine1.trim().length > 2 &&
          billing.city.trim().length > 1 &&
          billing.zipCode.trim().length > 2 &&
          isCountryValid),
      [showAddress, billing, isCountryValid]
    )
    const isFormValid = useMemo(
      () =>
        isCardNumberValid &&
        isExpiryMonthValid &&
        isExpiryYearValid &&
        isNameValid &&
        isSecurityCodeValid &&
        isAddressValid,
      [
        isCardNumberValid,
        isExpiryMonthValid,
        isExpiryYearValid,
        isNameValid,
        isSecurityCodeValid,
        isAddressValid,
      ]
    )

    function luhnCheck(num: string) {
      let sum = 0
      let shouldDouble = false
      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num.charAt(i), 10)
        if (shouldDouble) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        sum += digit
        shouldDouble = !shouldDouble
      }
      return sum % 10 === 0
    }

    const handleCardChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setCard((prev) => ({ ...prev, [name]: value }))
        setTouched((t) => ({ ...t, [name]: true }))
      },
      []
    )

    const handleBillingChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setBilling((prev) => ({ ...prev, [name]: value }))
        setTouched((t) => ({ ...t, [name]: true }))
      },
      []
    )

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        if (!isFormValid) {
          setFormError('Please fill all required fields correctly.')
          return
        }
        const payload: CreatePaymentMethodRequest = {
          ...card,
          recurringPaymentMethod: true,
        }
        createPaymentMethod.mutate(
          { data: payload },
          {
            onSuccess: () => {
              setShowSuccess(true)
              setTimeout(() => {
                setShowSuccess(false)
                if (onSuccess) onSuccess()
              }, 1200)
            },
            onError: (err: any) => {
              setFormError(
                (err as ProblemDetails)?.detail ||
                  (err as ProblemDetails)?.title ||
                  'Payment failed'
              )
              if (onError) onError(err)
            },
          }
        )
      },
      [card, isFormValid, createPaymentMethod, onSuccess, onError]
    )

    const handleCancel = useCallback(() => {
      if (onCancel) onCancel()
    }, [onCancel])

    const cardTypeOptions = useMemo(
      () =>
        supportedCardTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        )),
      [supportedCardTypes]
    )

    return (
      <motion.div
        className={`w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 ${className}`}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        aria-labelledby="payment-form-title"
        role="form"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          aria-describedby={formError ? 'payment-form-error' : undefined}
          autoComplete="off"
        >
          <h2
            id="payment-form-title"
            className="text-xl font-semibold mb-4 text-gray-800"
          >
            Payment Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="cardNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Card Number
              </label>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                aria-invalid={touched.cardNumber && !isCardNumberValid}
                aria-required="true"
                maxLength={19}
                className={`mt-1 block w-full rounded-md border ${
                  touched.cardNumber && !isCardNumberValid
                    ? 'border-red-500'
                    : 'border-gray-300'
                } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                value={card.cardNumber}
                onChange={handleCardChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label
                  htmlFor="expiryMonth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expiry Month
                </label>
                <input
                  id="expiryMonth"
                  name="expiryMonth"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  aria-invalid={touched.expiryMonth && !isExpiryMonthValid}
                  aria-required="true"
                  maxLength={2}
                  className={`mt-1 block w-full rounded-md border ${
                    touched.expiryMonth && !isExpiryMonthValid
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                  value={card.expiryMonth}
                  onChange={handleCardChange}
                  placeholder="MM"
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="expiryYear"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expiry Year
                </label>
                <input
                  id="expiryYear"
                  name="expiryYear"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  aria-invalid={touched.expiryYear && !isExpiryYearValid}
                  aria-required="true"
                  maxLength={4}
                  className={`mt-1 block w-full rounded-md border ${
                    touched.expiryYear && !isExpiryYearValid
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                  value={card.expiryYear}
                  onChange={handleCardChange}
                  placeholder="YYYY"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Cardholder Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="cc-name"
                aria-invalid={touched.name && !isNameValid}
                aria-required="true"
                className={`mt-1 block w-full rounded-md border ${
                  touched.name && !isNameValid
                    ? 'border-red-500'
                    : 'border-gray-300'
                } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                value={card.name}
                onChange={handleCardChange}
                placeholder="Name as on card"
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label
                  htmlFor="securityCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  CVV
                </label>
                <input
                  id="securityCode"
                  name="securityCode"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  aria-invalid={touched.securityCode && !isSecurityCodeValid}
                  aria-required="true"
                  maxLength={4}
                  className={`mt-1 block w-full rounded-md border ${
                    touched.securityCode && !isSecurityCodeValid
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                  value={card.securityCode}
                  onChange={handleCardChange}
                  placeholder="CVV"
                  required
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Card Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                  value={card.type}
                  onChange={handleCardChange}
                  aria-required="true"
                >
                  {cardTypeOptions}
                </select>
              </div>
            </div>
            {showBillingAddress && (
              <div>
                <button
                  type="button"
                  className="text-primary-600 underline text-sm"
                  onClick={() => setShowAddress((v) => !v)}
                  aria-expanded={showAddress}
                  aria-controls="billing-address-fields"
                >
                  {showAddress ? 'Hide' : 'Add'} Billing Address
                </button>
                <AnimatePresence>
                  {showAddress && (
                    <motion.div
                      id="billing-address-fields"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label
                            htmlFor="addressLine1"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Address Line 1
                          </label>
                          <input
                            id="addressLine1"
                            name="addressLine1"
                            type="text"
                            aria-required="true"
                            className={`mt-1 block w-full rounded-md border ${
                              touched.addressLine1 && !billing.addressLine1
                                ? 'border-red-500'
                                : 'border-gray-300'
                            } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                            value={billing.addressLine1}
                            onChange={handleBillingChange}
                            placeholder="Street address"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="addressLine2"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Address Line 2
                          </label>
                          <input
                            id="addressLine2"
                            name="addressLine2"
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                            value={billing.addressLine2}
                            onChange={handleBillingChange}
                            placeholder="Apartment, suite, etc. (optional)"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label
                              htmlFor="city"
                              className="block text-sm font-medium text-gray-700"
                            >
                              City
                            </label>
                            <input
                              id="city"
                              name="city"
                              type="text"
                              aria-required="true"
                              className={`mt-1 block w-full rounded-md border ${
                                touched.city && !billing.city
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                              value={billing.city}
                              onChange={handleBillingChange}
                              placeholder="City"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="state"
                              className="block text-sm font-medium text-gray-700"
                            >
                              State/Province
                            </label>
                            <input
                              id="state"
                              name="state"
                              type="text"
                              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 transition"
                              value={billing.state}
                              onChange={handleBillingChange}
                              placeholder="State/Province"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label
                              htmlFor="zipCode"
                              className="block text-sm font-medium text-gray-700"
                            >
                              ZIP/Postal Code
                            </label>
                            <input
                              id="zipCode"
                              name="zipCode"
                              type="text"
                              aria-required="true"
                              className={`mt-1 block w-full rounded-md border ${
                                touched.zipCode && !billing.zipCode
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                              value={billing.zipCode}
                              onChange={handleBillingChange}
                              placeholder="ZIP/Postal Code"
                              required
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="countryCode"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Country
                            </label>
                            <select
                              id="countryCode"
                              name="countryCode"
                              className={`mt-1 block w-full rounded-md border ${
                                touched.countryCode && !billing.countryCode
                                  ? 'border-red-500'
                                  : 'border-gray-300'
                              } shadow-sm focus:ring-primary-500 focus:border-primary-500 transition`}
                              value={billing.countryCode}
                              onChange={handleBillingChange}
                              aria-required="true"
                              required
                              disabled={countriesLoading}
                            >
                              <option value="">Select country</option>
                              {countries.map((c) => (
                                <option key={c.countryCode} value={c.countryCode}>
                                  {c.country}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <AnimatePresence>
              {formError && (
                <motion.div
                  id="payment-form-error"
                  className="bg-red-100 text-red-700 rounded px-3 py-2 text-sm mt-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="alert"
                  aria-live="assertive"
                >
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="bg-green-100 text-green-700 rounded px-3 py-2 text-sm mt-2"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  role="status"
                  aria-live="polite"
                >
                  Payment method added successfully!
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
                disabled={
                  createPaymentMethod.isLoading ||
                  !isFormValid ||
                  showSuccess
                }
                aria-busy={createPaymentMethod.isLoading}
                aria-disabled={
                  createPaymentMethod.isLoading ||
                  !isFormValid ||
                  showSuccess
                }
              >
                {createPaymentMethod.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Pay Now'
                )}
              </button>
              {onCancel && (
                <button
                  type="button"
                  className="w-full sm:w-auto flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={handleCancel}
                  aria-label="Cancel payment"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    )
  }
)
PaymentForm.displayName = 'PaymentForm'

