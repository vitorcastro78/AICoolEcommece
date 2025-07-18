tsx
// hooks/useSubscriptions.ts

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import type {
  GetSubscriptionDetailResponse,
  SubscriptionEntry,
  PostSubscriptionRequest,
  ProblemDetails,
} from '../api/types'
import {
  getSubscriptions,
  createSubscription,
} from '../api/subscriptionsService'

export interface UseSubscriptionsOptions {
  page?: number
  pageSize?: number
  [key: string]: any
}

export function useSubscriptions(params: UseSubscriptionsOptions = {}) {
  const queryKey: QueryKey = ['subscriptions', params]
  return useQuery<GetSubscriptionDetailResponse, ProblemDetails>({
    queryKey,
    queryFn: () => getSubscriptions(params),
    keepPreviousData: true,
    staleTime: 60_000,
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation<
    SubscriptionEntry,
    ProblemDetails,
    PostSubscriptionRequest
  >({
    mutationFn: async (data) => createSubscription(data),
    onMutate: async (newSub) => {
      await queryClient.cancelQueries({ queryKey: ['subscriptions'] })
      const prev = queryClient.getQueryData<GetSubscriptionDetailResponse>(['subscriptions', {}])
      if (prev) {
        queryClient.setQueryData<GetSubscriptionDetailResponse>(['subscriptions', {}], {
          ...prev,
          entries: [newSub as any, ...prev.entries],
          total: prev.total + 1,
        })
      }
      return { prev }
    },
    onError: (_err, _newSub, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['subscriptions', {}], ctx.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

tsx
// hooks/useSubscriptionDetail.ts

import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import type {
  SubscriptionDetail,
  GetSubscriptionDetailResponse,
  ProblemDetails,
  PutSubscriptionRequest,
  PutSubscriptionResponse,
} from '../api/types'
import {
  getSubscriptionDetail,
  putSubscriptionDetail,
} from '../api/subscriptionDetailService'

export function useSubscriptionDetail(subscriptionNumber: string, params?: { page?: number; pageSize?: number }) {
  const queryKey: QueryKey = ['subscriptionDetail', subscriptionNumber, params]
  return useQuery<GetSubscriptionDetailResponse, ProblemDetails>({
    queryKey,
    queryFn: () => getSubscriptionDetail(subscriptionNumber, params),
    enabled: !!subscriptionNumber,
    staleTime: 60_000,
  })
}

export function useUpdateSubscriptionDetail(subscriptionNumber: string) {
  const queryClient = useQueryClient()
  return useMutation<
    PutSubscriptionResponse,
    ProblemDetails,
    PutSubscriptionRequest
  >({
    mutationFn: (data) => putSubscriptionDetail(subscriptionNumber, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['subscriptionDetail', subscriptionNumber] })
      const prev = queryClient.getQueryData<GetSubscriptionDetailResponse>(['subscriptionDetail', subscriptionNumber])
      if (prev) {
        queryClient.setQueryData<GetSubscriptionDetailResponse>(['subscriptionDetail', subscriptionNumber], {
          ...prev,
          entries: prev.entries.map((entry) =>
            entry.number === subscriptionNumber ? { ...entry, ...data } : entry
          ),
        })
      }
      return { prev }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['subscriptionDetail', subscriptionNumber], ctx.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetail', subscriptionNumber] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
  })
}

tsx
// hooks/useSubscriptionPreview.ts

import { useMutation } from '@tanstack/react-query'
import type {
  PostSubscriptionPreviewRequest,
  SubscriptionPreviewResponse,
  ProblemDetails,
} from '../api/types'
import { postSubscriptionPreview } from '../api/subscriptionPreviewService'

export function useSubscriptionPreview() {
  return useMutation<
    SubscriptionPreviewResponse,
    ProblemDetails,
    PostSubscriptionPreviewRequest
  >({
    mutationFn: (data) => postSubscriptionPreview(data),
  })
}

tsx
// hooks/useCancelSubscription.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProblemDetails, ErrorMessage } from '../api/types'
import { cancelSubscription } from '../api/subscriptionCancellationService'

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; message?: string } | ProblemDetails | ErrorMessage,
    ProblemDetails,
    string
  >({
    mutationFn: (subscriptionNumber) => cancelSubscription(subscriptionNumber),
    onSuccess: (_data, subscriptionNumber) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetail', subscriptionNumber] })
    },
  })
}

tsx
// hooks/useCancelSubscriptionFromWorkflow.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  SubscriptionCancellationFromWorkflowRequest,
  SubscriptionCancellationFromWorkflowResponse,
  ProblemDetails,
} from '../api/types'
import { postSubscriptionCancellationFromWorkflow } from '../api/subscriptionCancellationFromWorkflowService'

export function useCancelSubscriptionFromWorkflow(subscriptionNumber: string) {
  const queryClient = useQueryClient()
  return useMutation<
    SubscriptionCancellationFromWorkflowResponse,
    ProblemDetails,
    SubscriptionCancellationFromWorkflowRequest
  >({
    mutationFn: (data) => postSubscriptionCancellationFromWorkflow(subscriptionNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptionDetail', subscriptionNumber] })
    },
  })
}

