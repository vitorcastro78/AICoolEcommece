tsx
// hooks/useCountries.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCountries, GetCountriesParams, GetCountriesResult } from '../api/countriesService'
import type { ProblemDetails } from '../api/types'

export const COUNTRIES_QUERY_KEY = 'countries'

export function useCountries(params?: GetCountriesParams) {
  const queryClient = useQueryClient()

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useQuery<GetCountriesResult, ProblemDetails>(
    [COUNTRIES_QUERY_KEY, params],
    () => getCountries(params),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  )

  const invalidate = () => {
    queryClient.invalidateQueries([COUNTRIES_QUERY_KEY])
  }

  return {
    countries: data?.data ?? [],
    total: data?.total,
    page: data?.page,
    pageSize: data?.pageSize,
    error: error ?? data?.error,
    isLoading,
    isFetching,
    isError,
    refetch,
    invalidate,
  }
}

