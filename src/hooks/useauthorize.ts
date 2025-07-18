tsx
// hooks/useAuthorizeClient.ts

import { useMutation, useQueryClient, MutationOptions, UseMutationResult } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'
import type { AuthorizationUrlRequest } from '../api/AuthorizationUrlRequest'
import type { AuthorizationUrlResponse } from '../api/ZippedBeans.Zip.Backend.Application.WebAPI.Models.Authentication.AuthorizationUrlResponse'
import type { ProblemDetails } from '../api/ProblemDetails'
import { postAuthorizeClient } from '../api/authorizeClientService'

type UseAuthorizeClientOptions = MutationOptions<
  AuthorizationUrlResponse,
  ProblemDetails,
  { data: AuthorizationUrlRequest; config?: AxiosRequestConfig }
>

export function useAuthorizeClient(
  options?: UseAuthorizeClientOptions
): UseMutationResult<
  AuthorizationUrlResponse,
  ProblemDetails,
  { data: AuthorizationUrlRequest; config?: AxiosRequestConfig }
> {
  const queryClient = useQueryClient()
  return useMutation<
    AuthorizationUrlResponse,
    ProblemDetails,
    { data: AuthorizationUrlRequest; config?: AxiosRequestConfig }
  >(
    async ({ data, config }) => {
      return await postAuthorizeClient(data, config)
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ['authorizeClient'] })
        if (options?.onSuccess) options.onSuccess(data, variables, context)
      },
      onError: (error, variables, context) => {
        if (options?.onError) options.onError(error, variables, context)
      },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ['authorizeClient'] })
        const previous = queryClient.getQueryData<AuthorizationUrlResponse>(['authorizeClient'])
        queryClient.setQueryData(['authorizeClient'], (old: AuthorizationUrlResponse | undefined) => ({
          ...(old || {}),
          ...variables.data,
        }))
        if (options?.onMutate) await options.onMutate(variables)
        return { previous }
      },
      onSettled: (data, error, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ['authorizeClient'] })
        if (options?.onSettled) options.onSettled(data, error, variables, context)
      },
    }
  )
}

