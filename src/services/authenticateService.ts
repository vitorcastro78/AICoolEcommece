
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { IdentityTokenRequest, TokenResponse, ProblemDetails } from './types';

const BASE_URL = '/api/authenticate/customer/identity';
const MAX_RETRIES = 3;
let authToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
});

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (authToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      authToken = null;
    }
    return Promise.reject(error);
  }
);

function setAuthToken(token: string) {
  authToken = token;
}

async function postIdentityToken(
  data: IdentityTokenRequest,
  retries = 0
): Promise<TokenResponse> {
  try {
    const response: AxiosResponse<TokenResponse> = await api.post(BASE_URL, data);
    if (response.data && response.data.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    if (
      retries < MAX_RETRIES &&
      axios.isAxiosError(error) &&
      (!error.response || error.response.status >= 500)
    ) {
      return postIdentityToken(data, retries + 1);
    }
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      throw error.response.data as ProblemDetails;
    }
    throw error;
  }
}

export { postIdentityToken, setAuthToken };

**Note:**  
- Place this code in a file (e.g., `authApiService.ts`).
- Ensure you have a `types.ts` file exporting the relevant interfaces (`IdentityTokenRequest`, `TokenResponse`, `ProblemDetails`) as per your provided JSON.  
- All requirements are fulfilled as per your instructions.