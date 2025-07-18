tsx
// hooks/useAuthenticateCustomerIdentity.ts

import { useMutation, useQueryClient, MutationFunction, UseMutationOptions } from '@tanstack/react-query'
import type { IdentityTokenRequest, TokenResponse, ProblemDetails } from '../api/types'
import { postIdentityToken } from '../api/authApiService'

type UseAuthenticateCustomerIdentityOptions = Omit<
  UseMutationOptions<TokenResponse, ProblemDetails, IdentityTokenRequest, { previousToken: TokenResponse | undefined }>,
  'mutationFn'
>

export function useAuthenticateCustomerIdentity(options?: UseAuthenticateCustomerIdentityOptions) {
  const queryClient = useQueryClient()

  const mutationFn: MutationFunction<TokenResponse, IdentityTokenRequest> = async (data) => {
    return await postIdentityToken(data)
  }

  return useMutation<TokenResponse, ProblemDetails, IdentityTokenRequest, { previousToken: TokenResponse | undefined }>({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['auth', 'token'] })
      const previousToken = queryClient.getQueryData<TokenResponse>(['auth', 'token'])
      queryClient.setQueryData(['auth', 'token'], undefined)
      return { previousToken }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'token'], data)
    },
    onError: (error, variables, context) => {
      if (context?.previousToken) {
        queryClient.setQueryData(['auth', 'token'], context.previousToken)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'token'] })
    },
    ...options,
  })
}

