tsx
import React, { useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import { useProductsSearch } from '../hooks/useProductsSearch'

export interface CategoryOption {
  id: string
  name: string
  count?: number
}

export interface CategoryFilterProps {
  /** List of available categories */
  categories?: CategoryOption[]
  /** Currently selected category id */
  selectedCategory?: string | null
  /** Callback when a category is selected */
  onChange?: (categoryId: string | null) => void
  /** Optional: show product counts per category */
  showCounts?: boolean
  /** Optional: search term to filter categories */
  searchTerm?: string
  /** Optional: className for container */
  className?: string
  /** Optional: aria-label for the filter group */
  ariaLabel?: string
}

const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

export const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(
  ({
    categories,
    selectedCategory,
    onChange,
    showCounts = true,
    searchTerm,
    className = '',
    ariaLabel = 'Product Categories',
  }) => {
    const {
      data: productsData,
      isLoading,
      isError,
      error,
      refetch,
    } = useProducts({ page: 1, pageSize: 100 })

    const { products: searchProducts, isLoading: isSearchLoading, isError: isSearchError } =
      useProductsSearch({ params: { query: searchTerm }, enabled: !!searchTerm })

    const computedCategories: CategoryOption[] = useMemo(() => {
      if (categories && categories.length > 0) return categories
      const source = searchTerm ? searchProducts : productsData?.entries ?? []
      const map = new Map<string, { name: string; count: number }>()
      for (const prod of source) {
        const cat = (prod as any).category || 'Uncategorized'
        if (!map.has(cat)) map.set(cat, { name: cat, count: 0 })
        map.get(cat)!.count += 1
      }
      return Array.from(map.entries()).map(([id, { name, count }]) => ({
        id,
        name,
        count,
      }))
    }, [categories, productsData, searchProducts, searchTerm])

    const handleSelect = useCallback(
      (catId: string | null) => {
        if (onChange) onChange(catId)
      },
      [onChange]
    )

    const isLoadingState = isLoading || isSearchLoading
    const isErrorState = isError || isSearchError

    return (
      <nav
        aria-label={ariaLabel}
        className={`w-full max-w-xs bg-white rounded-lg shadow-md p-4 ${className}`}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Categories</span>
          {isLoadingState && (
            <span
              role="status"
              aria-live="polite"
              className="ml-2 animate-spin text-blue-500"
            >
              <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
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
            </span>
          )}
        </div>
        {isErrorState ? (
          <div
            role="alert"
            aria-live="assertive"
            className="text-red-600 text-sm py-2"
          >
            Failed to load categories.
            <button
              type="button"
              onClick={() => refetch()}
              className="ml-2 underline text-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <ul
            className="flex flex-col gap-1"
            role="listbox"
            aria-activedescendant={selectedCategory ?? undefined}
          >
            <AnimatePresence>
              <motion.li
                key="all"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={variants}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  aria-selected={!selectedCategory}
                  aria-label="All categories"
                  className={`w-full flex items-center px-3 py-2 rounded transition-colors ${
                    !selectedCategory
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => handleSelect(null)}
                  tabIndex={0}
                >
                  <span className="flex-1 truncate">All</span>
                  {showCounts && (
                    <span className="ml-2 text-xs text-gray-500">
                      {productsData?.total ?? ''}
                    </span>
                  )}
                </button>
              </motion.li>
              {computedCategories.map((cat) => (
                <motion.li
                  key={cat.id}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    type="button"
                    aria-selected={selectedCategory === cat.id}
                    aria-label={cat.name}
                    className={`w-full flex items-center px-3 py-2 rounded transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-100 text-blue-700 font-bold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleSelect(cat.id)}
                    tabIndex={0}
                  >
                    <span className="flex-1 truncate">{cat.name}</span>
                    {showCounts && (
                      <span className="ml-2 text-xs text-gray-500">
                        {cat.count ?? ''}
                      </span>
                    )}
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </nav>
    )
  }
)
