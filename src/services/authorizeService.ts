// api/authorizeClientService.ts

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { AuthorizationUrlRequest } from './AuthorizationUrlRequest';
import type { AuthorizationUrlResponse } from './ZippedBeans.Zip.Backend.Application.WebAPI.Models.Authentication.AuthorizationUrlResponse';
import type { ProblemDetails } from './ProblemDetails';

const BASE_URL = '/api/authorize/client';
const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

let accessToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      accessToken = null;
    }
    return Promise.reject(error);
  }
);

function setAccessToken(token: string) {
  accessToken = token;
}

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY));
      }
    }
  }
  throw lastError;
}

export async function postAuthorizeClient(
  data: AuthorizationUrlRequest,
  config?: AxiosRequestConfig
): Promise<AuthorizationUrlResponse> {
  return retryRequest(async () => {
    try {
      const response = await api.post<AuthorizationUrlResponse>(BASE_URL, data, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const problem: ProblemDetails = error.response.data;
        throw problem;
      }
      throw error;
    }
  });
}

export { setAccessToken };