export interface CreditCardInfo {
  id: string;
  expirationMonth: string;
  cardNumber: string;
  expirationYear: string;
  cardType: string;
  cardHolderName: string;
}

export type { CreditCardInfo as GetPaymentMethodResponseCreditCardInfo };