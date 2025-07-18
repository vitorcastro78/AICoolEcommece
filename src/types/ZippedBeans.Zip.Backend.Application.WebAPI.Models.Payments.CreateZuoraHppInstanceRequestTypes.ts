export interface CreateZuoraHppInstanceRequest {
  paymentMethodType: 'CreditCard' | 'ACH' | 'PayPal' | 'SEPA' | string;
}