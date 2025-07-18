
// hooks/useRecurringPaymentMethod.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'
import type { PutRecurringPaymentMethodRequest } from '../api/PutRecurringPaymentMethodRequest'
import type { ProblemDetails } from '../api/ProblemDetails'
import { putRecurringPaymentMethod } from '../api/recurringPaymentMethodService'

type UseRecurringPaymentMethodOptions = {
  config?: AxiosRequestConfig
  onSuccess?: () => void
  onError?: (error: ProblemDetails) => void
  optimisticUpdate?: (data: PutRecurringPaymentMethodRequest) => void
  rollback?: () => void
}

export function useRecurringPaymentMethod(options?: UseRecurringPaymentMethodOptions) {
  const queryClient = useQueryClient()
  const mutation = useMutation<void, ProblemDetails, PutRecurringPaymentMethodRequest>({
    mutationFn: (data) => putRecurringPaymentMethod(data, options?.config),
    onMutate: async (variables) => {
      if (options?.optimisticUpdate) options.optimisticUpdate(variables)
      await queryClient.cancelQueries({ queryKey: ['payment-methods'] })
      const previous = queryClient.getQueryData(['payment-methods'])
      queryClient.setQueryData(['payment-methods'], (old: any) => {
        if (!old || !old.entries) return old
        return {
          ...old,
          entries: old.entries.map((pm: any) =>
            pm.id === variables.paymentMethodId
              ? { ...pm, isDefault: true }
              : { ...pm, isDefault: false }
          ),
        }
      })
      return { previous }
    },
    onError: (error, _variables, context) => {
      if (options?.rollback) options.rollback()
      if (context?.previous) queryClient.setQueryData(['payment-methods'], context.previous)
      if (options?.onError) options.onError(error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
      queryClient.invalidateQueries({ queryKey: ['default-payment-method'] })
      if (options?.onSuccess) options.onSuccess()
    },
  })
  return {
    putRecurringPaymentMethod: mutation.mutate,
    putRecurringPaymentMethodAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  }
}

