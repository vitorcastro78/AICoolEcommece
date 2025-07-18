// api/recurringPaymentMethodService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { PutRecurringPaymentMethodRequest } from './PutRecurringPaymentMethodRequest'
import type { ProblemDetails } from './ProblemDetails'

const BASE_URL = '/api/recurring-payment-method'
const MAX_RETRIES = 2

let authToken: string | null = null

export const setAuthToken = (token: string) => {
  authToken = token
}

const api: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${authToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (
        axios.isAxiosError(err) &&
        (!err.response || err.response.status >= 500)
      ) {
        if (attempt < retries) continue
      }
      break
    }
  }
  throw lastError
}

export const putRecurringPaymentMethod = async (
  data: PutRecurringPaymentMethodRequest,
  config?: AxiosRequestConfig
): Promise<void> => {
  await retryRequest(async () => {
    await api.put<void>(BASE_URL, data, config)
  })
}

export type { PutRecurringPaymentMethodRequest, ProblemDetails }