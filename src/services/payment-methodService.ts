// api/paymentMethodsService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface GetPaymentMethodResponse {
  id: string
  isDefault: boolean
  paymentMethodType: string
  creditCardData: null
}

export interface CreditCardInfo {
  id: string
  expirationMonth: string
  cardNumber: string
  expirationYear: string
  cardType: string
  cardHolderName: string
}

export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
}

export interface GetPaymentMethodsParams {
  page?: number
  pageSize?: number
}

const MAX_RETRIES = 3

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

async function getPaymentMethods(
  params?: GetPaymentMethodsParams,
  retryCount = 0
): Promise<{ entries: GetPaymentMethodResponse[]; total: number; page: number; pageSize: number }> {
  try {
    const config: AxiosRequestConfig = {
      params,
    }
    const res: AxiosResponse<{
      entries: GetPaymentMethodResponse[]
      total: number
      page: number
      pageSize: number
    }> = await api.get('/payment-methods', config)
    return res.data
  } catch (error: any) {
    if (retryCount < MAX_RETRIES) {
      return getPaymentMethods(params, retryCount + 1)
    }
    if (error.response && error.response.data) {
      throw error.response.data as ProblemDetails
    }
    throw {
      title: 'Unknown error',
      detail: error.message || 'An unknown error occurred',
      status: 500,
    } as ProblemDetails
  }
}

export { getPaymentMethods }