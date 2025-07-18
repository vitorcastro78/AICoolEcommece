// CardDetails.ts

export interface CardDetails {
  type: string; // e.g., 'scheme'
  cardNumber: string; // 13-19 digits, Luhn valid
  expiryMonth: string; // MM, 01-12
  expiryYear: string; // YYYY, >= current year
  name: string; // Cardholder name, non-empty
  securityCode: string; // 3-4 digits
}

export type CreateAdyenPaymentRequestCardDetails = CardDetails;