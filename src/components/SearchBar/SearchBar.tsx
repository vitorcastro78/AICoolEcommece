tsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
  memo,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductSearch } from '../hooks/useProducts'
import type { ProductSearchParams, ProductSearchResult, GetProductListResponse } from '../api/productsApiService'

export interface SearchBarProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string
  /**
   * Minimum characters before search triggers
   * @default 2
   */
  minLength?: number
  /**
   * Debounce delay in ms
   * @default 300
   */
  debounce?: number
  /**
   * Callback when a product is selected
   */
  onSelect?: (product: GetProductListResponse) => void
  /**
   * Optional className for the wrapper
   */
  className?: string
  /**
   * Optional initial value
   */
  initialValue?: string
  /**
   * Optional aria-label for the input
   */
  ariaLabel?: string
}

const SearchBar: React.FC<SearchBarProps> = memo(
  ({
    placeholder = 'Search products...',
    minLength = 2,
    debounce = 300,
    onSelect,
    className = '',
    initialValue = '',
    ariaLabel = 'Product search',
  }) => {
    const [query, setQuery] = useState(initialValue)
    const [inputValue, setInputValue] = useState(initialValue)
    const [isFocused, setIsFocused] = useState(false)
    const [highlighted, setHighlighted] = useState<number>(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

    const {
      data,
      isLoading,
      isError,
      error,
      refetch,
      isFetching,
    } = useProductSearch(
      query.length >= minLength
        ? { query, page: 1, pageSize: 8 }
        : { query: '', page: 1, pageSize: 8 }
    )

    useEffect(() => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      debounceTimeout.current = setTimeout(() => {
        setQuery(inputValue)
      }, debounce)
      return () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      }
    }, [inputValue, debounce])

    const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      setHighlighted(-1)
    }, [])

    const handleFocus = useCallback(() => setIsFocused(true), [])
    const handleBlur = useCallback(() => setTimeout(() => setIsFocused(false), 120), [])

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (!data?.entries?.length) return
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setHighlighted((h) => (h < data.entries.length - 1 ? h + 1 : 0))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setHighlighted((h) => (h > 0 ? h - 1 : data.entries.length - 1))
        } else if (e.key === 'Enter') {
          if (highlighted >= 0 && data.entries[highlighted]) {
            handleSelect(data.entries[highlighted])
          }
        } else if (e.key === 'Escape') {
          setIsFocused(false)
        }
      },
      [data, highlighted]
    )

    const handleSelect = useCallback(
      (product: GetProductListResponse) => {
        setInputValue(product.name)
        setQuery(product.name)
        setIsFocused(false)
        setHighlighted(-1)
        if (onSelect) onSelect(product)
      },
      [onSelect]
    )

    const showDropdown =
      isFocused &&
      inputValue.length >= minLength &&
      (isLoading || isFetching || !!data?.entries?.length || isError)

    return (
      <div className={`relative w-full max-w-lg mx-auto ${className}`}>
        <label htmlFor="searchbar-input" className="sr-only">
          {ariaLabel}
        </label>
        <div className="flex items-center bg-white rounded-lg shadow border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 transition">
          <svg
            className="w-5 h-5 text-gray-400 ml-3"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 20 20"
          >
            <path
              fill="currentColor"
              d="M12.9 14.32a8 8 0 111.41-1.41l4.38 4.37a1 1 0 01-1.42 1.42l-4.37-4.38zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            ref={inputRef}
            id="searchbar-input"
            type="text"
            className="flex-1 py-2 px-3 bg-transparent outline-none text-gray-900 placeholder-gray-400"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={ariaLabel}
            aria-autocomplete="list"
            aria-controls="searchbar-listbox"
            aria-expanded={showDropdown}
            aria-activedescendant={
              highlighted >= 0 && data?.entries?.[highlighted]
                ? `searchbar-option-${data.entries[highlighted].id}`
                : undefined
            }
            role="combobox"
            autoComplete="off"
            spellCheck={false}
          />
          {(isLoading || isFetching) && (
            <svg
              className="animate-spin h-5 w-5 text-primary-500 mr-3"
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
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
        </div>
        <AnimatePresence>
          {showDropdown && (
            <motion.ul
              ref={listRef}
              id="searchbar-listbox"
              role="listbox"
              aria-label="Product suggestions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto"
            >
              {isError && (
                <li
                  className="px-4 py-3 text-red-500 text-sm"
                  role="alert"
                  aria-live="assertive"
                >
                  {(error as any)?.title || 'Something went wrong.'}
                </li>
              )}
              {!isLoading && !isError && data?.entries?.length === 0 && (
                <li className="px-4 py-3 text-gray-500 text-sm" role="option" aria-disabled="true">
                  No products found.
                </li>
              )}
              {data?.entries?.map((product, idx) => (
                <motion.li
                  key={product.id}
                  id={`searchbar-option-${product.id}`}
                  role="option"
                  aria-selected={highlighted === idx}
                  tabIndex={-1}
                  className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                    highlighted === idx
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(product)
                  }}
                  onMouseEnter={() => setHighlighted(idx)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-8 h-8 object-cover rounded mr-3 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block font-medium truncate">{product.name}</span>
                    <span className="block text-xs text-gray-500 truncate">{product.description}</span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

export default SearchBar
