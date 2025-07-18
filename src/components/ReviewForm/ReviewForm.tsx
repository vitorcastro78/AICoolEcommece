tsx
import React, { useState, useCallback, memo, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ReviewFormProps {
  productId: string
  productName?: string
  onSubmit?: (review: ReviewFormData) => Promise<void> | void
  loading?: boolean
  error?: string | null
  initialRating?: number
  initialText?: string
  userName?: string
  disabled?: boolean
}

export interface ReviewFormData {
  productId: string
  rating: number
  text: string
  userName?: string
}

const ratingLabels = [
  'Very Bad',
  'Bad',
  'Okay',
  'Good',
  'Excellent'
]

/**
 * ReviewForm component for submitting product reviews in a subscription ecommerce.
 */
export const ReviewForm: React.FC<ReviewFormProps> = memo(
  ({
    productId,
    productName,
    onSubmit,
    loading = false,
    error = null,
    initialRating = 0,
    initialText = '',
    userName = '',
    disabled = false
  }) => {
    const [rating, setRating] = useState<number>(initialRating)
    const [hoverRating, setHoverRating] = useState<number>(0)
    const [text, setText] = useState<string>(initialText)
    const [name, setName] = useState<string>(userName)
    const [formError, setFormError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const isLoading = loading || submitting

    const handleRating = useCallback((value: number) => {
      if (!disabled && !isLoading) setRating(value)
    }, [disabled, isLoading])

    const handleHover = useCallback((value: number) => {
      if (!disabled && !isLoading) setHoverRating(value)
    }, [disabled, isLoading])

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value)
    }, [])

    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value)
    }, [])

    const validate = useCallback(() => {
      if (rating < 1 || rating > 5) return 'Please select a rating.'
      if (!text.trim() || text.length < 10) return 'Please enter at least 10 characters in your review.'
      if (name && name.length > 50) return 'Name is too long.'
      return null
    }, [rating, text, name])

    const handleSubmit = useCallback(
      async (e: FormEvent) => {
        e.preventDefault()
        if (isLoading) return
        setFormError(null)
        const err = validate()
        if (err) {
          setFormError(err)
          return
        }
        setSubmitting(true)
        try {
          await onSubmit?.({
            productId,
            rating,
            text: text.trim(),
            userName: name.trim() || undefined
          })
          setText('')
          setRating(0)
          setName(userName || '')
        } catch (submitError: any) {
          setFormError(submitError?.message || 'Failed to submit review.')
        } finally {
          setSubmitting(false)
        }
      },
      [isLoading, onSubmit, productId, rating, text, name, userName, validate]
    )

    return (
      <motion.form
        layout
        aria-label={`Review form for ${productName || 'product'}`}
        className="w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 flex flex-col gap-6"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2" id="rating-label">
            Your Rating
          </label>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-labelledby="rating-label"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                aria-checked={rating === star}
                role="radio"
                tabIndex={0}
                disabled={disabled || isLoading}
                className={`transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${star <= (hoverRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300 dark:text-gray-700'}
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  text-2xl`}
                onMouseEnter={() => handleHover(star)}
                onMouseLeave={() => handleHover(0)}
                onFocus={() => handleHover(star)}
                onBlur={() => handleHover(0)}
                onClick={() => handleRating(star)}
                whileTap={{ scale: 1.2 }}
                whileHover={{ scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span aria-hidden="true">★</span>
              </motion.button>
            ))}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
              {rating > 0 ? ratingLabels[rating - 1] : ''}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Your Review
          </label>
          <textarea
            id="review-text"
            name="review"
            rows={4}
            minLength={10}
            maxLength={1000}
            required
            aria-required="true"
            aria-invalid={!!formError}
            disabled={disabled || isLoading}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition disabled:opacity-60"
            placeholder="Share your experience (at least 10 characters)..."
            value={text}
            onChange={handleTextChange}
            aria-describedby="review-text-desc"
          />
          <div id="review-text-desc" className="text-xs text-gray-400 mt-1">
            {text.length}/1000 characters
          </div>
        </div>
        <div>
          <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Name <span className="text-xs text-gray-400">(optional)</span>
          </label>
          <input
            id="review-name"
            name="name"
            type="text"
            maxLength={50}
            autoComplete="name"
            disabled={disabled || isLoading}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-gray-900 dark:text-gray-100 focus:ring-primary-500 focus:border-primary-500 transition disabled:opacity-60"
            placeholder="Your name"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <AnimatePresence>
          {(formError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-red-600 dark:text-red-400 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {formError || error}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          type="submit"
          className="w-full py-3 rounded-md bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={disabled || isLoading}
          aria-disabled={disabled || isLoading}
          aria-busy={isLoading}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Review'
          )}
        </motion.button>
      </motion.form>
    )
  }
)

