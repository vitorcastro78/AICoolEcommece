// api/hppZuoraService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import type {
  CreateZuoraHppInstanceRequest,
  CreateZuoraHppInstanceResponse,
  ProblemDetails
} from './types'

const BASE_URL = '/api/hpp/zuora'
const MAX_RETRIES = 3

let authToken: string | null = null

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
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

export const setAuthToken = (token: string) => {
  authToken = token
}

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: any
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (
        axios.isAxiosError(error) &&
        (!error.response || error.response.status >= 500)
      ) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)))
        continue
      }
      break
    }
  }
  throw lastError
}

export const createZuoraHppInstance = async (
  data: CreateZuoraHppInstanceRequest,
  config?: AxiosRequestConfig
): Promise<CreateZuoraHppInstanceResponse> => {
  return retryRequest(async () => {
    const response = await api.post<CreateZuoraHppInstanceResponse>(
      '',
      data,
      config
    )
    return response.data
  })
}

export type { CreateZuoraHppInstanceRequest, CreateZuoraHppInstanceResponse, ProblemDetails }