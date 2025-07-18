
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface CardDetails {
  type: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  name: string;
  securityCode: string;
}

export interface CreateAdyenPaymentRequest {
  card?: unknown;
  invoiceId: string;
}

export interface CreateAdyenPaymentResponse {
  resultCode: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

const apiBaseUrl = '/api/payment';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const MAX_RETRIES = 2;
const RETRY_DELAY = 800;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postPayment(
  data: CreateAdyenPaymentRequest,
  retries = 0
): Promise<CreateAdyenPaymentResponse> {
  try {
    const response = await axiosInstance.post<CreateAdyenPaymentResponse>('/', data);
    return response.data;
  } catch (error) {
    if (
      retries < MAX_RETRIES &&
      axios.isAxiosError(error) &&
      (!error.response || error.response.status >= 500)
    ) {
      await delay(RETRY_DELAY * (retries + 1));
      return postPayment(data, retries + 1);
    }
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data as ProblemDetails;
    }
    throw error;
  }
}

export { postPayment };
