// GetInvoicesResponse.ts

export interface InvoiceEntry {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productId: string;
  subscriptionPlanId?: string;
}

export interface GetInvoicesResponse {
  entries: InvoiceEntry[];
  total: number;
  page: number;
  pageSize: number;
}