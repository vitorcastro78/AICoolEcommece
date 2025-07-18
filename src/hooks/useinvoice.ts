tsx
// hooks/useInvoices.ts
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { getInvoices, GetInvoicesParams } from '../api/invoicesService'
import type { GetInvoicesResponse } from '../api/GetInvoicesResponse'
import type { ProblemDetails } from '../api/ProblemDetails'

export const INVOICES_QUERY_KEY = 'invoices'

export function useInvoices(
  params: GetInvoicesParams = {},
  options?: UseQueryOptions<GetInvoicesResponse, ProblemDetails>
) {
  const queryClient = useQueryClient()
  const query = useQuery<GetInvoicesResponse, ProblemDetails>(
    [INVOICES_QUERY_KEY, params],
    () => getInvoices(params),
    {
      keepPreviousData: true,
      ...options,
    }
  )

  const invalidate = () => {
    queryClient.invalidateQueries([INVOICES_QUERY_KEY])
  }

  return {
    ...query,
    invalidate,
  }
}

