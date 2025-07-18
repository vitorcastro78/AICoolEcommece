
// hooks/usePaymentMethods.ts

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import type { GetPaymentMethodResponse, ProblemDetails, GetPaymentMethodsParams } from '../api/paymentMethodsService'
import { getPaymentMethods } from '../api/paymentMethodsService'
import { createPaymentMethod, deletePaymentMethod } from '../api/paymentMethodService'
import type { CreatePaymentMethodRequest } from '../api/CreatePaymentMethodRequest'
import type { DeletePaymentMethodRequest } from '../api/DeletePaymentMethodRequest'

type PaymentMethodsQueryKey = [string, GetPaymentMethodsParams?]

const PAYMENT_METHODS_QUERY_KEY = 'payment-methods'

export function usePaymentMethods(params?: GetPaymentMethodsParams) {
  return useQuery<{
    entries: GetPaymentMethodResponse[]
    total: number
    page: number
    pageSize: number
  }, ProblemDetails, {
    entries: GetPaymentMethodResponse[]
    total: number
    page: number
    pageSize: number
  }, PaymentMethodsQueryKey>(
    [PAYMENT_METHODS_QUERY_KEY, params],
    () => getPaymentMethods(params),
    {
      keepPreviousData: true,
      retry: 2,
    }
  )
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation<void | ProblemDetails, unknown, CreatePaymentMethodRequest>({
    mutationFn: (data) => createPaymentMethod(data),
    onMutate: async (newMethod) => {
      await queryClient.cancelQueries({ queryKey: [PAYMENT_METHODS_QUERY_KEY] })
      const prev = queryClient.getQueriesData<{ entries: GetPaymentMethodResponse[] }>([PAYMENT_METHODS_QUERY_KEY])
      queryClient.setQueriesData<{ entries: GetPaymentMethodResponse[] }>(
        [PAYMENT_METHODS_QUERY_KEY],
        (old) => {
          if (!old) return old
          return {
            ...old,
            entries: [
              {
                id: 'optimistic-' + Math.random().toString(36).slice(2),
                isDefault: false,
                paymentMethodType: newMethod.type,
                creditCardData: null,
              },
              ...old.entries,
            ],
          }
        }
      )
      return { prev }
    },
    onError: (_err, _newMethod, context) => {
      if (context?.prev) {
        for (const [key, value] of context.prev) {
          queryClient.setQueryData(key, value)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_METHODS_QUERY_KEY] })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation<void | ProblemDetails, unknown, DeletePaymentMethodRequest>({
    mutationFn: (data) => deletePaymentMethod(data),
    onMutate: async (deleted) => {
      await queryClient.cancelQueries({ queryKey: [PAYMENT_METHODS_QUERY_KEY] })
      const prev = queryClient.getQueriesData<{ entries: GetPaymentMethodResponse[] }>([PAYMENT_METHODS_QUERY_KEY])
      queryClient.setQueriesData<{ entries: GetPaymentMethodResponse[] }>(
        [PAYMENT_METHODS_QUERY_KEY],
        (old) => {
          if (!old) return old
          return {
            ...old,
            entries: old.entries.filter((m) => m.id !== deleted.paymentMethodId),
          }
        }
      )
      return { prev }
    },
    onError: (_err, _deleted, context) => {
      if (context?.prev) {
        for (const [key, value] of context.prev) {
          queryClient.setQueryData(key, value)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_METHODS_QUERY_KEY] })
    },
  })
}
