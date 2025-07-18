// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Subscriptions.GetSubscriptionDetailResponse.ts

export interface SubscriptionEntry {
  [key: string]: any;
}

export interface GetSubscriptionDetailResponse {
  entries: SubscriptionEntry[];
  total: number;
  page: number;
  pageSize: number;
}