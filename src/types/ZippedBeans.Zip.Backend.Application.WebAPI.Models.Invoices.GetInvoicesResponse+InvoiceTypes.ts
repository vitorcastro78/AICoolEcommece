// Invoice.ts

export interface Invoice {
  id: string;
  number: string;
  date: string; // ISO 8601 date string
  currency: string; // ISO 4217 currency code
  amount: number;
  isBalance: boolean;
  balance: number;
  dueDate: string; // ISO 8601 date string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | string;
}