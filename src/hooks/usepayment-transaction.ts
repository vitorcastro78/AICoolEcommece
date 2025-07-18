
// hooks/usePaymentTransaction.ts

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import type {
  PutPaymentTransactionRequest,
  PutPaymentTransactionResponse,
  ProblemDetails,
} from '../api/types'
import { putPaymentTransaction } from '../api/paymentTransactionsService'

type UsePutPaymentTransactionOptions = UseMutationOptions<
  PutPaymentTransactionResponse,
  ProblemDetails,
  { transactionId: string; data: PutPaymentTransactionRequest }
>

export function usePutPaymentTransaction(options?: UsePutPaymentTransactionOptions) {
  const queryClient = useQueryClient()

  return useMutation<
    PutPaymentTransactionResponse,
    ProblemDetails,
    { transactionId: string; data: PutPaymentTransactionRequest }
  >(
    async ({ transactionId, data }) => {
      return await putPaymentTransaction(transactionId, data)
    },
    {
      onMutate: async ({ transactionId, data }) => {
        await queryClient.cancelQueries(['payment-transaction', transactionId])
        const previous = queryClient.getQueryData<PutPaymentTransactionResponse>([
          'payment-transaction',
          transactionId,
        ])
        queryClient.setQueryData<PutPaymentTransactionResponse>(
          ['payment-transaction', transactionId],
          (old) => ({
            ...(old || {}),
            isPaymentSuccess: data.paymentResult === 'success',
          })
        )
        return { previous }
      },
      onError: (err, variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            ['payment-transaction', variables.transactionId],
            context.previous
          )
        }
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries(['payment-transaction', variables.transactionId])
        queryClient.invalidateQueries(['payment-transactions'])
      },
      ...options,
    }
  )
}

