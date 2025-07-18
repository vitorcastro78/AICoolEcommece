
// hooks/useCustomers.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import type {
  GetCustomerResponse,
  PostCustomerRequest,
  PutCustomerRequest,
  ProblemDetails,
} from '../api/customersService'
import {
  getCustomers,
  postCustomer,
  putCustomer,
} from '../api/customersService'

type CustomersQueryParams = { page?: number; pageSize?: number }

export function useCustomers(
  params: CustomersQueryParams = {},
  options?: UseQueryOptions<
    { entries: GetCustomerResponse[]; total: number; page: number; pageSize: number },
    ProblemDetails
  >
) {
  return useQuery(
    ['customers', params],
    () => getCustomers(params),
    {
      keepPreviousData: true,
      ...options,
    }
  )
}

export function useCreateCustomer(
  options?: UseMutationOptions<
    GetCustomerResponse,
    ProblemDetails,
    PostCustomerRequest
  >
) {
  const queryClient = useQueryClient()
  return useMutation(
    (data: PostCustomerRequest) => postCustomer(data),
    {
      ...options,
      onMutate: async (newCustomer) => {
        await queryClient.cancelQueries({ queryKey: ['customers'] })
        const previous = queryClient.getQueryData<{ entries: GetCustomerResponse[]; total: number; page: number; pageSize: number }>(['customers'])
        if (previous) {
          queryClient.setQueryData(['customers'], {
            ...previous,
            entries: [ 
              {
                accountNumber: 'optimistic-' + Date.now(),
                firstName: newCustomer.personalInfo?.firstName ?? '',
                lastName: newCustomer.personalInfo?.lastName ?? '',
                email: newCustomer.contactInfo?.email ?? '',
                currency: newCustomer.currency,
                phoneNumber: newCustomer.contactInfo?.phone ?? '',
                addresses: newCustomer.addresses,
                additionalEmails: [],
                accountId: 'optimistic-' + Date.now(),
              },
              ...previous.entries,
            ],
            total: previous.total + 1,
          })
        }
        return { previous }
      },
      onError: (_err, _newCustomer, context: any) => {
        if (context?.previous) {
          queryClient.setQueryData(['customers'], context.previous)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
      },
    }
  )
}

export function useUpdateCustomer(
  accountId: string,
  options?: UseMutationOptions<
    GetCustomerResponse,
    ProblemDetails,
    PutCustomerRequest
  >
) {
  const queryClient = useQueryClient()
  return useMutation(
    (data: PutCustomerRequest) => putCustomer(accountId, data),
    {
      ...options,
      onMutate: async (updatedCustomer) => {
        await queryClient.cancelQueries({ queryKey: ['customers'] })
        const previous = queryClient.getQueryData<{ entries: GetCustomerResponse[]; total: number; page: number; pageSize: number }>(['customers'])
        if (previous) {
          queryClient.setQueryData(['customers'], {
            ...previous,
            entries: previous.entries.map((c) =>
              c.accountId === accountId
                ? {
                    ...c,
                    firstName: updatedCustomer.personalInfo.firstName,
                    lastName: updatedCustomer.personalInfo.lastName,
                    email: updatedCustomer.contactInfo.email,
                    phoneNumber: updatedCustomer.contactInfo.phoneNumber ?? '',
                    addresses: updatedCustomer.addresses,
                    additionalEmails: updatedCustomer.additionalEmailAddresses ?? [],
                  }
                : c
            ),
          })
        }
        return { previous }
      },
      onError: (_err, _updatedCustomer, context: any) => {
        if (context?.previous) {
          queryClient.setQueryData(['customers'], context.previous)
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['customers'] })
      },
    }
  )
}

