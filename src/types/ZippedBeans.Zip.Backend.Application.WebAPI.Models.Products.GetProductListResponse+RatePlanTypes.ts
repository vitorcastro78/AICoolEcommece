// RatePlan.ts

export interface RatePlanCharge {
  [key: string]: any;
}

export interface RatePlan {
  id: string;
  name: string;
  description: string;
  status: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  totalPrice: number;
  rateplanCharges: RatePlanCharge[];
}