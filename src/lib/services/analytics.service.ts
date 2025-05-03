// services/analyticsService.ts
import { Transaction } from "@/types/transaction";

interface ApiResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasMore: boolean;
    limit: number;
  };
  totals: {
    totalIncome: number;
    totalExpense: number;
  };
}

export interface AnalyticsData {
  expense: number;
  income: number;
  total: number;
  expanseCategories: CategoryData[];
  incomeCategories: CategoryData[];
  dailyFlow: DailyFlowData[];
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface DailyFlowData {
  date: string;
  amount: number;
}

export const fetchMonthlyAnalytics = async (year: number, month: number): Promise<AnalyticsData> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/monthly/${year}/${month}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch analytics data");
    }

    const data: ApiResponse = await response.json();
    const transactions = data.transactions;

    // Extract income and expense totals from API response
    const expenseTotal = data.totals.totalExpense;
    const incomeTotal = data.totals.totalIncome;

    // Process expense transactions
    const expenseTransactions = transactions.filter(t => t.type === "expense");
    const incomeTransactions = transactions.filter(t => t.type === "income");

    // Calculate expense categories
    const expenseCategoryMap = new Map<string, number>();
    expenseTransactions.forEach(t => {
      const currentAmount = expenseCategoryMap.get(t.category) || 0;
      expenseCategoryMap.set(t.category, currentAmount + Math.abs(t.amount));
    });

    const expanseCategories: CategoryData[] = Array.from(expenseCategoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: expenseTotal ? (value / expenseTotal) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate income categories
    const incomeCategoryMap = new Map<string, number>();
    incomeTransactions.forEach(t => {
      const currentAmount = incomeCategoryMap.get(t.category) || 0;
      incomeCategoryMap.set(t.category, currentAmount + t.amount);
    });

    const incomeCategories: CategoryData[] = Array.from(incomeCategoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: incomeTotal ? (value / incomeTotal) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    // Create daily flow data with better date formatting
    const dailyFlowMap = new Map<string, number>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const day = date.getUTCDate().toString();
      const amount = t.type === "expense" ? -Math.abs(t.amount) : t.amount;
      
      const currentAmount = dailyFlowMap.get(day) || 0;
      dailyFlowMap.set(day, currentAmount + amount);
    });
    
    // Create a full array of days in the month (1-31 or appropriate)
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyFlow: DailyFlowData[] = Array.from({ length: daysInMonth }, (_, i) => {
      const day = (i + 1).toString();
      return {
        date: day,
        amount: dailyFlowMap.get(day) || 0
      };
    });

    return {
      expense: expenseTotal,
      income: incomeTotal,
      total: incomeTotal - expenseTotal,
      expanseCategories,
      incomeCategories,
      dailyFlow
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    throw error;
  }
};