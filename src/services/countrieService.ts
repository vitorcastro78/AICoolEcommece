// api/countriesService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { GetCountriesResponse } from './types'
import type { ProblemDetails } from './types'

const BASE_URL = '/api/countries'
const MAX_RETRIES = 3
const RETRY_DELAY = 500

let accessToken: string | null = null

export const setAccessToken = (token: string) => {
  accessToken = token
}

const api: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
})

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // handle token refresh if needed
    }
    return Promise.reject(error)
  }
)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function retryRequest<T>(fn: () => Promise<AxiosResponse<T>>, retries = MAX_RETRIES): Promise<AxiosResponse<T>> {
  let lastError
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries - 1) {
        await sleep(RETRY_DELAY)
      }
    }
  }
  throw lastError
}

export interface GetCountriesParams {
  page?: number
  pageSize?: number
  [key: string]: any
}

export interface GetCountriesResult {
  data: GetCountriesResponse[]
  total?: number
  page?: number
  pageSize?: number
  error?: ProblemDetails
}

export async function getCountries(params?: GetCountriesParams): Promise<GetCountriesResult> {
  try {
    const response = await retryRequest(() =>
      api.get<GetCountriesResponse[]>(BASE_URL, { params })
    )
    const total = Number(response.headers['x-total-count']) || undefined
    const page = params?.page
    const pageSize = params?.pageSize
    return {
      data: response.data,
      total,
      page,
      pageSize,
    }
  } catch (error: any) {
    let problem: ProblemDetails = {}
    if (error.response && error.response.data) {
      problem = error.response.data
    }
    return {
      data: [],
      error: problem,
    }
  }
}