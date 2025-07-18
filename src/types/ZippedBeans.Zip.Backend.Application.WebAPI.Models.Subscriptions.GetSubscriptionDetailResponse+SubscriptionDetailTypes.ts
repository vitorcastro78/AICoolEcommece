// SubscriptionDetail.ts

export interface SubscriptionDetail {
  number: string;
  startDate: string;
  endDate: string;
  status: string | null;
  ratePlans: any[]; 
  currentTerm: number;
  autoRenew: boolean;
  initialTerm: number;
  renewalTerm: number;
}