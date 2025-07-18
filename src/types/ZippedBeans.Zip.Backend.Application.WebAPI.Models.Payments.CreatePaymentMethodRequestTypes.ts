// CreatePaymentMethodRequest.ts

export interface CreatePaymentMethodRequest {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  name: string;
  securityCode: string;
  type: string;
  recurringPaymentMethod: boolean;
}

export interface CreatePaymentMethodRequestValidated extends CreatePaymentMethodRequest {
  isValidCardNumber: boolean;
  isValidExpiryMonth: boolean;
  isValidExpiryYear: boolean;
  isValidName: boolean;
  isValidSecurityCode: boolean;
  isValidType: boolean;
}