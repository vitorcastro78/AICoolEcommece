// Rb2.Core.Subscription.Enums.SubscriptionStatus.ts

export interface SubscriptionStatus {
  value: SubscriptionStatusEnum;
}

export type SubscriptionStatusEnum =
  | 'Active'
  | 'Inactive'
  | 'Pending'
  | 'Cancelled'
  | 'Expired'
  | 'Suspended';