export interface TransactionData {
  date: string;
  usd?: number;
  eur?: number;
  rub?: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionData[];
  totalSize: number;
  skip: number;
  take: number;
}

export interface CategorySummary {
  name: string;
  usd?: number;
  eur?: number;
  rub?: number;
  color?: string;
}

export interface FinanceData {
  summary: {
    totalUsdExpenses: number;
    totalEurExpenses: number;
    totalRubExpenses: number;
    totalUsdIncome: number;
    totalEurIncome: number;
    totalRubIncome: number;
    currentUsdBalance: number;
    currentEurBalance: number;
    currentRubBalance: number;
  };
  categories: CategorySummary[];
  transactions: TransactionData[];
}

export interface CurrencySummary {
  usd?: { expenses: number; income: number; balance: number };
  eur?: { expenses: number; income: number; balance: number };
  rub?: { expenses: number; income: number; balance: number };
}
