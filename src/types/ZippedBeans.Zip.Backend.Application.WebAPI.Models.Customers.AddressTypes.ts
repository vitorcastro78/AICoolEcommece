// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Customers.Address.ts

export interface Address {
  type: string;
  addressLine1: string;
  addressLine2?: string;
  zipCode: string;
  city: string;
  countryCode: string;
  stateProvince?: string;
}