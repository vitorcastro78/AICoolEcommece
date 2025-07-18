// ZippedBeans.Zip.Backend.Application.WebAPI.Models.Products.GetProductListResponse.ts

export interface RatePlan {
  [key: string]: any;
}

export interface GetProductListResponse {
  sku: string;
  name: string;
  id: string;
  description: string;
  imageUrl: string;
  ratePlans: RatePlan[];
}