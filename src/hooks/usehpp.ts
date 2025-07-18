
// hooks/useCreateZuoraHppInstance.ts

import { useMutation, useQueryClient, MutationFunction, UseMutationOptions } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'
import type {
  CreateZuoraHppInstanceRequest,
  CreateZuoraHppInstanceResponse,
  ProblemDetails
} from '../api/types'
import { createZuoraHppInstance } from '../api/hppZuoraService'

type Variables = {
  data: CreateZuoraHppInstanceRequest
  config?: AxiosRequestConfig
}

export function useCreateZuoraHppInstance(
  options?: UseMutationOptions<
    CreateZuoraHppInstanceResponse,
    ProblemDetails,
    Variables
  >
) {
  const queryClient = useQueryClient()

  const mutationFn: MutationFunction<CreateZuoraHppInstanceResponse, Variables> = async ({ data, config }) => {
    return await createZuoraHppInstance(data, config)
  }

  return useMutation<
    CreateZuoraHppInstanceResponse,
    ProblemDetails,
    Variables
  >(mutationFn, {
    ...options,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['zuoraHppInstances'] })
      const previous = queryClient.getQueryData<CreateZuoraHppInstanceResponse[]>(['zuoraHppInstances'])
      queryClient.setQueryData<CreateZuoraHppInstanceResponse[]>(
        ['zuoraHppInstances'],
        (old) => old ? [...old, { ...variables.data, ...{ url: '', signature: '', token: '', tenantId: '', key: '', pageId: '', subscriptionAccountId: '', paymentGateway: '' } }] : [{ ...variables.data, ...{ url: '', signature: '', token: '', tenantId: '', key: '', pageId: '', subscriptionAccountId: '', paymentGateway: '' } }]
      )
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['zuoraHppInstances'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['zuoraHppInstances'] })
    },
    ...options,
  })
}

Usage example in a component:
tsx
// import { useCreateZuoraHppInstance } from 'path/to/hooks/useCreateZuoraHppInstance'

const { mutate, isLoading, error, data, reset } = useCreateZuoraHppInstance()

This hook provides loading, error, and data states, supports optimistic updates, and invalidates the cache for the Zuora HPP instances list after mutation. Pagination is not directly relevant for a POST/create operation, but the cache key is structured for future extensibility.