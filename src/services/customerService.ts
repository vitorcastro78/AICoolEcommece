
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type?: 'billing' | 'shipping' | 'other';
  isDefault?: boolean;
  isPrimary?: boolean;
  addressType?: 'billing' | 'shipping' | 'other';
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface ContactInfo {
  email: string;
  phone?: string;
  phoneNumber?: string;
  preferredContactMethod?: 'email' | 'phone';
}

export interface PostCustomerRequest {
  currency: string;
  personalInfo?: PersonalInfo;
  contactInfo?: ContactInfo;
  addresses: Address[];
}

export interface PutCustomerRequest {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  addresses: Address[];
  additionalEmailAddresses?: string[];
}

export interface GetCustomerResponse {
  accountNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  currency: string;
  phoneNumber: string;
  addresses: Address[];
  additionalEmails: string[];
  accountId: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

const BASE_URL = '/api/customers';
const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

async function retryRequest<T>(fn: () => Promise<AxiosResponse<T>>, retries = MAX_RETRIES): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  if (lastError && lastError.response && lastError.response.data) {
    throw lastError.response.data as ProblemDetails;
  }
  throw lastError;
}

export async function getCustomers(params?: { page?: number; pageSize?: number }): Promise<{ entries: GetCustomerResponse[]; total: number; page: number; pageSize: number }> {
  return retryRequest(() =>
    api.get('', {
      params,
    })
  );
}

export async function postCustomer(data: PostCustomerRequest): Promise<GetCustomerResponse> {
  return retryRequest(() => api.post('', data));
}

export async function putCustomer(accountId: string, data: PutCustomerRequest): Promise<GetCustomerResponse> {
  return retryRequest(() => api.put(`/${encodeURIComponent(accountId)}`, data));
}
