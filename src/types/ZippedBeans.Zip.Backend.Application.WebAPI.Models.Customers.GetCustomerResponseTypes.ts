// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Customers.GetCustomerResponse.ts

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
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