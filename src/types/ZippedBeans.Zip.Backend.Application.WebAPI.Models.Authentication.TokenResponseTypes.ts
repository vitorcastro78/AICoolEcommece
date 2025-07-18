// TokenResponse.ts

export interface TokenResponse {
  token: string;
  tokenType: 'Bearer' | 'JWT' | string;
  expiresAt: string;
}