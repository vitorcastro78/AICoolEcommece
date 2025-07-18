// api/productsService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { GetProductListResponse, RatePlan } from './types'

const BASE_URL = '/api/products'
const MAX_RETRIES = 3
const RETRY_DELAY = 500

let authToken: string | null = null

export const setAuthToken = (token: string) => {
  authToken = token
}

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // handle unauthorized globally if needed
    }
    return Promise.reject(error)
  }
)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function requestWithRetry<T>(
  config: AxiosRequestConfig,
  retries = MAX_RETRIES
): Promise<AxiosResponse<T>> {
  let lastError
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await api.request<T>(config)
    } catch (error) {
      lastError = error
      if (attempt < retries - 1) {
        await delay(RETRY_DELAY)
      }
    }
  }
  throw lastError
}

export interface GetProductsParams {
  page?: number
  pageSize?: number
  [key: string]: any
}

export interface GetProductsResponse {
  entries: GetProductListResponse[]
  total: number
  page: number
  pageSize: number
}

export async function getProducts(
  params: GetProductsParams = {}
): Promise<GetProductsResponse> {
  try {
    const response = await requestWithRetry<GetProductsResponse>({
      method: 'get',
      url: '',
      params,
    })
    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw error
  }
}