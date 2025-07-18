
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface SubscriptionEntry {
  [key: string]: any;
}

export interface GetSubscriptionDetailResponse {
  entries: SubscriptionEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PostSubscriptionRequest {
  products: string[];
  promoCode?: string;
}

const BASE_URL = '/api/subscriptions';
const MAX_RETRIES = 3;
let accessToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
});

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setAccessToken = (token: string) => {
  accessToken = token;
};

const retryRequest = async <T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries = MAX_RETRIES
): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      lastError = error;
      const axiosError = error as AxiosError;
      if (!axiosError.response || axiosError.response.status >= 500) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
        continue;
      }
      throw axiosError;
    }
  }
  throw lastError;
};

export interface GetSubscriptionsParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export const getSubscriptions = async (
  params?: GetSubscriptionsParams
): Promise<GetSubscriptionDetailResponse> => {
  return retryRequest<GetSubscriptionDetailResponse>(() =>
    api.get(BASE_URL, { params })
  );
};

export const createSubscription = async (
  data: PostSubscriptionRequest
): Promise<SubscriptionEntry> => {
  return retryRequest<SubscriptionEntry>(() =>
    api.post(BASE_URL, data)
  );
};
