// RatePlan.ts

export interface RatePlan {
  id: string;
  product: any;
  name: string;
  charges: any[];
  cartQuantity: number;
}