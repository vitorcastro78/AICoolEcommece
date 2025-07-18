// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Customers.PostCustomerRequest+Contact.ts

export interface Contact {
  email: string;
  phoneNumber: string;
  mobileNumber: string;
}

export interface ContactValidation {
  isValidEmail(email: string): boolean;
  isValidPhoneNumber(phoneNumber: string): boolean;
  isValidMobileNumber(mobileNumber: string): boolean;
}