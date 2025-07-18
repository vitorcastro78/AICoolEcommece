// api/invoicesService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type { GetInvoicesResponse } from './GetInvoicesResponse'
import type { ProblemDetails } from './ProblemDetails'

const BASE_URL = '/api/invoices'
const MAX_RETRIES = 2

let authToken: string | null = null

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
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

export const setAuthToken = (token: string) => {
  authToken = token
}

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: any
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const axiosError = error as AxiosError
      if (
        attempt === retries ||
        (axiosError.response && axiosError.response.status < 500)
      ) {
        throw error
      }
      await new Promise((res) => setTimeout(res, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

export interface GetInvoicesParams {
  page?: number
  pageSize?: number
  status?: string
  customerId?: string
  subscriptionId?: string
  fromDate?: string
  toDate?: string
}

export const getInvoices = async (
  params: GetInvoicesParams = {}
): Promise<GetInvoicesResponse> => {
  return retryRequest(async () => {
    try {
      const config: AxiosRequestConfig = { params }
      const { data } = await api.get<GetInvoicesResponse>('', config)
      return data
    } catch (error) {
      const axiosError = error as AxiosError<ProblemDetails>
      if (axiosError.response && axiosError.response.data) {
        throw axiosError.response.data
      }
      throw error
    }
  })
}