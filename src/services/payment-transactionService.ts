// api/paymentTransactionsService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { PutPaymentTransactionRequest, PutPaymentTransactionResponse } from './types';

const BASE_URL = '/api/payment-transactions';
const MAX_RETRIES = 3;
let accessToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // handle token refresh logic here if needed
    }
    return Promise.reject(error);
  }
);

export const setPaymentTransactionsAccessToken = (token: string) => {
  accessToken = token;
};

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries - 1) throw lastError;
      await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
    }
  }
  throw lastError;
};

export const putPaymentTransaction = async (
  transactionId: string,
  data: PutPaymentTransactionRequest,
  config?: AxiosRequestConfig
): Promise<PutPaymentTransactionResponse> => {
  return retryRequest(async () => {
    const response = await api.put<PutPaymentTransactionResponse>(
      `/${transactionId}`,
      data,
      config
    );
    return response.data;
  });
};