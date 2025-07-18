tsx
// hooks/useProducts.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts, GetProductsParams, GetProductsResponse } from '../api/productsService'
import { getProductById } from '../api/productsService'
import { getSearchProductList, ProductSearchParams, ProductSearchResult } from '../api/productsApiService'
import { clearProductsCache } from '../api/products/clearCacheApi'
import type { ProblemDetails } from '../api/types'

export function useProducts(params: GetProductsParams = {}) {
  return useQuery<GetProductsResponse, ProblemDetails>({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productId ? getProductById(productId) : Promise.reject(),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useProductSearch(params: ProductSearchParams = {}) {
  return useQuery<ProductSearchResult, ProblemDetails>({
    queryKey: ['products-search', params],
    queryFn: () => getSearchProductList(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })
}

export function useClearProductsCache() {
  const queryClient = useQueryClient()
  return async () => {
    await clearProductsCache()
    await queryClient.invalidateQueries({ queryKey: ['products'] })
    await queryClient.invalidateQueries({ queryKey: ['products-search'] })
    await queryClient.invalidateQueries({ queryKey: ['product'] })
  }
}

