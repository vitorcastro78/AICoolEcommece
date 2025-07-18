tsx
// hooks/usePayment.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateAdyenPaymentRequest, CreateAdyenPaymentResponse, ProblemDetails } from '../api/types'
import { postPayment } from '../api/payment'
import { useState } from 'react'

export function usePayment() {
  const queryClient = useQueryClient()
  const [optimisticResult, setOptimisticResult] = useState<CreateAdyenPaymentResponse | null>(null)

  const mutation = useMutation<CreateAdyenPaymentResponse, ProblemDetails, CreateAdyenPaymentRequest>({
    mutationFn: async (data) => {
      return await postPayment(data)
    },
    onMutate: async (variables) => {
      setOptimisticResult({ resultCode: 'PENDING' })
    },
    onSuccess: (data, variables) => {
      setOptimisticResult(data)
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
    onError: (error, variables, context) => {
      setOptimisticResult(null)
    },
    onSettled: () => {
      setOptimisticResult(null)
    }
  })

  return {
    pay: mutation.mutate,
    payAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data ?? optimisticResult,
    reset: mutation.reset,
  }
}

