// RatePlanCharge.ts

export interface RatePlanCharge {
  id: string;
  name: string;
  billingPeriod: 'Monthly' | 'Yearly' | 'Weekly' | 'Daily' | string;
  pricing?: unknown;
}