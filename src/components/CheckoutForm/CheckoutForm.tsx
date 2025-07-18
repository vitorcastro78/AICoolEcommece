tsx
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCountries } from '../hooks/useCountries'
import { useCreateCustomer } from '../hooks/useCustomers'
import { usePaymentMethods, useCreatePaymentMethod } from '../hooks/usePaymentMethods'
import { useSubscriptionPreview } from '../hooks/useSubscriptionPreview'
import { useCreateSubscription } from '../hooks/useSubscriptions'
import type { GetCountriesResponse } from '../api/types'
import type { PostCustomerRequest, PersonalInfo, ContactInfo, Address } from '../api/types'
import type { CreatePaymentMethodRequest } from '../api/CreatePaymentMethodRequest'

export interface CheckoutFormProps {
  /** Product IDs to subscribe to */
  productIds: string[]
  /** Optional promo code */
  promoCode?: string
  /** Currency code (ISO 4217) */
  currency: string
  /** Callback on successful checkout */
  onSuccess?: (subscriptionId: string) => void
  /** Callback on error */
  onError?: (error: unknown) => void
  /** Optional: prefill customer info */
  initialPersonalInfo?: Partial<PersonalInfo>
  initialContactInfo?: Partial<ContactInfo>
  initialAddress?: Partial<Address>
}

/**
 * Responsive, animated, accessible checkout form for subscription ecommerce.
 */
export const CheckoutForm: React.FC<CheckoutFormProps> = React.memo(
  ({
    productIds,
    promoCode,
    currency,
    onSuccess,
    onError,
    initialPersonalInfo,
    initialContactInfo,
    initialAddress,
  }) => {
    const [step, setStep] = useState(0)
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
      firstName: initialPersonalInfo?.firstName ?? '',
      lastName: initialPersonalInfo?.lastName ?? '',
      dateOfBirth: initialPersonalInfo?.dateOfBirth,
      gender: initialPersonalInfo?.gender,
    })
    const [contactInfo, setContactInfo] = useState<ContactInfo>({
      email: initialContactInfo?.email ?? '',
      phone: initialContactInfo?.phone,
    })
    const [address, setAddress] = useState<Address>({
      street: initialAddress?.street ?? '',
      city: initialAddress?.city ?? '',
      state: initialAddress?.state,
      postalCode: initialAddress?.postalCode ?? '',
      country: initialAddress?.country ?? '',
      type: 'billing',
      isDefault: true,
    })
    const [payment, setPayment] = useState<CreatePaymentMethodRequest>({
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      name: '',
      securityCode: '',
      type: 'CreditCard',
      recurringPaymentMethod: true,
    })
    const [agreed, setAgreed] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    const { countries, isLoading: loadingCountries } = useCountries()
    const { mutateAsync: createCustomer, isLoading: loadingCustomer } = useCreateCustomer()
    const { data: paymentMethodsData, isLoading: loadingPaymentMethods } = usePaymentMethods()
    const { mutateAsync: createPaymentMethod, isLoading: loadingCreatePayment } = useCreatePaymentMethod()
    const { mutateAsync: previewSubscription, isLoading: loadingPreview, data: previewData } = useSubscriptionPreview()
    const { mutateAsync: createSubscription, isLoading: loadingSubscription } = useCreateSubscription()

    const isLoading = loadingCountries || loadingCustomer || loadingPaymentMethods || loadingCreatePayment || loadingPreview || loadingSubscription

    useEffect(() => {
      setFormError(null)
    }, [step])

    const countryOptions = useMemo(
      () =>
        countries.map((c: GetCountriesResponse) => (
          <option key={c.countryCode} value={c.countryCode}>
            {c.country}
          </option>
        )),
      [countries]
    )

    const handlePersonalInfoChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setPersonalInfo((prev) => ({ ...prev, [name]: value }))
      },
      []
    )

    const handleContactInfoChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setContactInfo((prev) => ({ ...prev, [name]: value }))
      },
      []
    )

    const handleAddressChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setAddress((prev) => ({ ...prev, [name]: value }))
      },
      []
    )

    const handlePaymentChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPayment((prev) => ({ ...prev, [name]: value }))
      },
      []
    )

    const validateStep = useCallback(() => {
      if (step === 0) {
        if (!personalInfo.firstName || !personalInfo.lastName) {
          setFormError('Please enter your name.')
          return false
        }
        if (!contactInfo.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) {
          setFormError('Please enter a valid email.')
          return false
        }
        return true
      }
      if (step === 1) {
        if (!address.street || !address.city || !address.postalCode || !address.country) {
          setFormError('Please fill in your address.')
          return false
        }
        return true
      }
      if (step === 2) {
        if (
          !payment.cardNumber ||
          !/^\d{13,19}$/.test(payment.cardNumber.replace(/\s/g, '')) ||
          !payment.expiryMonth ||
          !/^(0[1-9]|1[0-2])$/.test(payment.expiryMonth) ||
          !payment.expiryYear ||
          !/^\d{4}$/.test(payment.expiryYear) ||
          !payment.name ||
          !payment.securityCode ||
          !/^\d{3,4}$/.test(payment.securityCode)
        ) {
          setFormError('Please enter valid payment details.')
          return false
        }
        return true
      }
      if (step === 3) {
        if (!agreed) {
          setFormError('You must agree to the terms.')
          return false
        }
        return true
      }
      return true
    }, [step, personalInfo, contactInfo, address, payment, agreed])

    const handleNext = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        if (!validateStep()) return
        if (step === 2) {
          try {
            await previewSubscription({
              products: productIds,
              promoCode,
            })
          } catch (err: any) {
            setFormError(err?.detail || 'Could not preview subscription.')
            return
          }
        }
        setStep((s) => s + 1)
      },
      [step, validateStep, previewSubscription, productIds, promoCode]
    )

    const handleBack = useCallback(() => {
      setFormError(null)
      setStep((s) => Math.max(0, s - 1))
    }, [])

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError(null)
        if (!validateStep()) return
        try {
          const customerReq: PostCustomerRequest = {
            currency,
            personalInfo,
            contactInfo,
            addresses: [{ ...address, type: 'billing', isDefault: true }],
          }
          const customer = await createCustomer(customerReq)
          await createPaymentMethod({ ...payment })
          const subscription = await createSubscription({
            products: productIds,
            promoCode,
          })
          if (onSuccess) onSuccess(subscription?.id || '')
        } catch (err: any) {
          setFormError(err?.detail || 'Checkout failed.')
          if (onError) onError(err)
        }
      },
      [
        validateStep,
        currency,
        personalInfo,
        contactInfo,
        address,
        payment,
        createCustomer,
        createPaymentMethod,
        createSubscription,
        productIds,
        promoCode,
        onSuccess,
        onError,
      ]
    )

    const steps = useMemo(
      () => [
        {
          label: 'Your Info',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={personalInfo.firstName}
                  onChange={handlePersonalInfoChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={personalInfo.lastName}
                  onChange={handlePersonalInfoChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={contactInfo.email}
                  onChange={handleContactInfoChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={contactInfo.phone ?? ''}
                  onChange={handleContactInfoChange}
                />
              </div>
            </div>
          ),
        },
        {
          label: 'Address',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium">
                  Street
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  autoComplete="street-address"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium">
                  State/Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={address.state ?? ''}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium">
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                  aria-required="true"
                  disabled={loadingCountries}
                >
                  <option value="">Select country</option>
                  {countryOptions}
                </select>
              </div>
            </div>
          ),
        },
        {
          label: 'Payment',
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={payment.cardNumber}
                  onChange={handlePaymentChange}
                  required
                  aria-required="true"
                  maxLength={19}
                  pattern="\d{13,19}"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name on Card
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="cc-name"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={payment.name}
                  onChange={handlePaymentChange}
                  required
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium">
                  Expiry Month (MM)
                </label>
                <input
                  id="expiryMonth"
                  name="expiryMonth"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-month"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={payment.expiryMonth}
                  onChange={handlePaymentChange}
                  required
                  aria-required="true"
                  maxLength={2}
                  pattern="0[1-9]|1[0-2]"
                />
              </div>
              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium">
                  Expiry Year (YYYY)
                </label>
                <input
                  id="expiryYear"
                  name="expiryYear"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp-year"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={payment.expiryYear}
                  onChange={handlePaymentChange}
                  required
                  aria-required="true"
                  maxLength={4}
                  pattern="\d{4}"
                />
              </div>
              <div>
                <label htmlFor="securityCode" className="block text-sm font-medium">
                  Security Code (CVV)
                </label>
                <input
                  id="securityCode"
                  name="securityCode"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  className="mt-1 block w-full rounded border-gray-300 focus:ring-primary focus:border-primary"
                  value={payment.securityCode}
                  onChange={handlePaymentChange}
                  required
                  aria-required="true"
                  maxLength={4}
                  pattern="\d{3,4}"
                />
              </div>
            </div>
          ),
        },
        {
          label: 'Review & Confirm',
          content: (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded p-4">
                <div className="font-semibold mb-2">Subscription Summary</div>
                {loadingPreview ? (
                  <div className="text-primary">Loading preview...</div>
                ) : previewData ? (
                  <div>
                    <div>
                      <span className="font-medium">Total:</span>{' '}
                      <span>
                        {previewData.totalPrice.toLocaleString(undefined, {
                          style: 'currency',
                          currency: previewData.currency,
                        })}
                      </span>
                    </div>
                    {previewData.discountAmount ? (
                      <div>
                        <span className="font-medium">Discount:</span>{' '}
                        <span>
                          {previewData.discountAmount.toLocaleString(undefined, {
                            style: 'currency',
                            currency: previewData.currency,
                          })}
                        </span>
                      </div>
                    ) : null}
                    {previewData.promoCode ? (
                      <div>
                        <span className="font-medium">Promo Code:</span> {previewData.promoCode}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-gray-500">No preview available.</div>
                )}
              </div>
              <div className="flex items-center">
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed((a) => !a)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  aria-checked={agreed}
                  aria-required="true"
                  required
                />
                <label htmlFor="agree" className="ml-2 block text-sm">
                  I agree to the <a href="/terms" className="underline text-primary">terms and conditions</a>
                </label>
              </div>
            </div>
          ),
        },
      ],
      [
        personalInfo,
        contactInfo,
        address,
        payment,
        countryOptions,
        loadingCountries,
        loadingPreview,
        previewData,
        agreed,
      ]
    )

    return (
      <form
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-10 space-y-8"
        aria-labelledby="checkout-form-title"
        onSubmit={step === steps.length - 1 ? handleSubmit : handleNext}
        noValidate
      >
        <h2 id="checkout-form-title" className="text-2xl font-bold mb-2 text-center">
          Checkout
        </h2>
        <nav aria-label="Progress" className="flex justify-center mb-6">
          <ol className="flex space-x-2">
            {steps.map((s, i) => (
              <li key={s.label}>
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                    i === step
                      ? 'border-primary bg-primary text-white'
                      : i < step
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={s.label}
                >
                  {i + 1}
                </span>
              </li>
            ))}
          </ol>
        </nav>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="min-h-[180px]"
            aria-live="polite"
          >
            {steps[step].content}
          </motion.div>
        </AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-red-600 text-sm mt-2"
            role="alert"
            aria-live="assertive"
          >
            {formError}
          </motion.div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || isLoading}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            aria-disabled={step === 0 || isLoading}
          >
            Back
          </button>
          <div className="flex-1" />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            aria-busy={isLoading}
            aria-disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
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
                Processing...
              </span>
            ) : step === steps.length - 1 ? (
              'Confirm & Pay'
            ) : (
              'Next'
            )}
          </button>
        </div>
      </form>
    )
  }
)
