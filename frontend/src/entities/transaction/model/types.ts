export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  amount: string;
  type: TransactionType;
  description: string;
  date: string;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsSummary {
  totalIncome: string;
  totalExpense: string;
  balance: string;
}

export interface TransactionsPage {
  transactions: Transaction[];
  summary: TransactionsSummary;
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}
