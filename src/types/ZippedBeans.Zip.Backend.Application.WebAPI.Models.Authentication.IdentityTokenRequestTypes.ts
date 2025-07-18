// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Authentication.IdentityTokenRequest.ts

export interface IdentityTokenRequest {
  clientId: string;
  clientSecret: string;
  identityId: string;
  identityEmail: string;
  identityLocale: string;
}

export type IdentityTokenRequestKeys = keyof IdentityTokenRequest;

export type IdentityTokenRequestValidation = {
  [K in IdentityTokenRequestKeys]: (value: string) => boolean;
};

export const identityTokenRequestValidation: IdentityTokenRequestValidation = {
  clientId: (value: string) => typeof value === 'string' && value.trim().length > 0,
  clientSecret: (value: string) => typeof value === 'string' && value.trim().length > 0,
  identityId: (value: string) => typeof value === 'string' && value.trim().length > 0,
  identityEmail: (value: string) =>
    typeof value === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  identityLocale: (value: string) =>
    typeof value === 'string' &&
    /^[a-z]{2,3}(-[A-Z]{2})?$/.test(value),
};