tsx
import React, { useState, useMemo, useCallback, useEffect, memo, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useCountries } from '../hooks/useCountries'
import type { Address } from '../api/customersService'
import type { GetCountriesResponse, ProblemDetails } from '../api/types'

export interface AddressFormProps {
  /**
   * Initial address values (for edit mode)
   */
  initialAddress?: Partial<Address>
  /**
   * Called when the form is submitted with valid address data
   */
  onSubmit: (address: Address) => void | Promise<void>
  /**
   * Called when the user cancels the form
   */
  onCancel?: () => void
  /**
   * Loading state for submit button
   */
  isSubmitting?: boolean
  /**
   * Optional error to display
   */
  error?: ProblemDetails | string | null
  /**
   * Address type (shipping, billing, other)
   */
  type?: 'shipping' | 'billing' | 'other'
  /**
   * Hide cancel button
   */
  hideCancel?: boolean
  /**
   * Custom submit button label
   */
  submitLabel?: string
  /**
   * Custom cancel button label
   */
  cancelLabel?: string
}

const required = (v: string | undefined) => !!v && v.trim().length > 0

const validate = (address: Partial<Address>) => {
  const errors: Partial<Record<keyof Address, string>> = {}
  if (!required(address.street)) errors.street = 'Street is required'
  if (!required(address.city)) errors.city = 'City is required'
  if (!required(address.postalCode)) errors.postalCode = 'Postal code is required'
  if (!required(address.country)) errors.country = 'Country is required'
  return errors
}

const AddressForm: React.FC<AddressFormProps> = memo(
  ({
    initialAddress,
    onSubmit,
    onCancel,
    isSubmitting,
    error,
    type,
    hideCancel,
    submitLabel = 'Save Address',
    cancelLabel = 'Cancel',
  }) => {
    const [address, setAddress] = useState<Partial<Address>>({
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      type,
      ...initialAddress,
    })
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [formError, setFormError] = useState<string | null>(null)
    const [localError, setLocalError] = useState<Partial<Record<keyof Address, string>>>({})
    const { countries, isLoading: isCountriesLoading, error: countriesError } = useCountries()

    useEffect(() => {
      setAddress((prev) => ({
        ...prev,
        ...initialAddress,
        type: type ?? prev.type,
      }))
    }, [initialAddress, type])

    const countryOptions = useMemo(
      () =>
        countries.map((c: GetCountriesResponse) => ({
          label: c.country,
          value: c.countryCode || c.country,
        })),
      [countries]
    )

    const errors = useMemo(() => validate(address), [address])

    const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setAddress((prev) => ({ ...prev, [name]: value }))
        setTouched((prev) => ({ ...prev, [name]: true }))
        setLocalError((prev) => ({ ...prev, [name]: undefined }))
        setFormError(null)
      },
      []
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target
        setTouched((prev) => ({ ...prev, [name]: true }))
        if (errors[name as keyof Address]) {
          setLocalError((prev) => ({ ...prev, [name]: errors[name as keyof Address] }))
        }
      },
      [errors]
    )

    const handleSubmit = useCallback(
      async (e: FormEvent) => {
        e.preventDefault()
        setTouched({
          street: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        })
        setLocalError(errors)
        setFormError(null)
        if (!isValid) {
          setFormError('Please fill all required fields.')
          return
        }
        try {
          await onSubmit({
            street: address.street!.trim(),
            city: address.city!.trim(),
            state: address.state?.trim() || '',
            postalCode: address.postalCode!.trim(),
            country: address.country!.trim(),
            type: address.type ?? type ?? 'shipping',
            isDefault: (address as any).isDefault ?? false,
          })
        } catch (err: any) {
          setFormError(
            typeof err === 'string'
              ? err
              : err?.detail || err?.message || 'Failed to save address'
          )
        }
      },
      [address, errors, isValid, onSubmit, type]
    )

    const showError = (field: keyof Address) =>
      (touched[field] || isSubmitting) && (localError[field] || errors[field])

    return (
      <motion.form
        onSubmit={handleSubmit}
        aria-label="Address form"
        className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 flex flex-col gap-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25 }}
        noValidate
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
              Street <span className="text-red-500">*</span>
            </label>
            <input
              id="street"
              name="street"
              type="text"
              autoComplete="address-line1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                showError('street') ? 'border-red-500' : 'border-gray-300'
              }`}
              value={address.street || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!showError('street')}
              aria-describedby={showError('street') ? 'street-error' : undefined}
              disabled={isSubmitting}
            />
            {showError('street') && (
              <motion.div
                id="street-error"
                className="text-xs text-red-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {localError.street || errors.street}
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              id="city"
              name="city"
              type="text"
              autoComplete="address-level2"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                showError('city') ? 'border-red-500' : 'border-gray-300'
              }`}
              value={address.city || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!showError('city')}
              aria-describedby={showError('city') ? 'city-error' : undefined}
              disabled={isSubmitting}
            />
            {showError('city') && (
              <motion.div
                id="city-error"
                className="text-xs text-red-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {localError.city || errors.city}
              </motion.div>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              id="state"
              name="state"
              type="text"
              autoComplete="address-level1"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
              value={address.state || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="false"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              autoComplete="postal-code"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                showError('postalCode') ? 'border-red-500' : 'border-gray-300'
              }`}
              value={address.postalCode || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!showError('postalCode')}
              aria-describedby={showError('postalCode') ? 'postalCode-error' : undefined}
              disabled={isSubmitting}
            />
            {showError('postalCode') && (
              <motion.div
                id="postalCode-error"
                className="text-xs text-red-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {localError.postalCode || errors.postalCode}
              </motion.div>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                showError('country') ? 'border-red-500' : 'border-gray-300'
              }`}
              value={address.country || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-required="true"
              aria-invalid={!!showError('country')}
              aria-describedby={showError('country') ? 'country-error' : undefined}
              disabled={isCountriesLoading || isSubmitting}
            >
              <option value="" disabled>
                {isCountriesLoading ? 'Loading countries...' : 'Select country'}
              </option>
              {countryOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {showError('country') && (
              <motion.div
                id="country-error"
                className="text-xs text-red-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {localError.country || errors.country}
              </motion.div>
            )}
            {countriesError && (
              <motion.div
                className="text-xs text-red-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {typeof countriesError === 'string'
                  ? countriesError
                  : countriesError?.detail || 'Failed to load countries'}
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <select
              id="type"
              name="type"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition border-gray-300"
              value={address.type || type || 'shipping'}
              onChange={handleChange}
              aria-required="false"
              disabled={isSubmitting}
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        {(formError || error) && (
          <motion.div
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
            aria-live="assertive"
          >
            {typeof (formError || error) === 'string'
              ? formError || error
              : (formError || error)?.detail || (formError || error)?.title || 'An error occurred'}
          </motion.div>
        )}
        <div className="flex flex-row gap-4 mt-4 justify-end">
          {!hideCancel && (
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={onCancel}
              disabled={isSubmitting}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
          )}
          <motion.button
            type="submit"
            className={`px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition flex items-center justify-center min-w-[120px] ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            aria-label={submitLabel}
            aria-busy={isSubmitting}
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
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
            ) : null}
            {submitLabel}
          </motion.button>
        </div>
      </motion.form>
    )
  }
)

export default AddressForm

