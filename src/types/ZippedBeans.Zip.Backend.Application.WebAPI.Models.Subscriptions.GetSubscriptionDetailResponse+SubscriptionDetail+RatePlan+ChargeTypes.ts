export interface Charge {
  id: string;
  name: string;
  quantity: number;
  billingPeriod: string;
  pricing?: unknown;
  model?: unknown;
  discountAmount: number;
  discountPercentage: number;
}