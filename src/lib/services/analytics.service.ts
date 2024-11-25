// services/analyticsService.ts
import { ITransaction } from "@/models/transaction.model";

export const fetchMonthlyAnalytics = async (year: number, month: number) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/monthly/${year}/${month}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch data");
    }

    const transactions: ITransaction[] = await response.json();

    // Process expense transactions
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );
    const incomeTransactions = transactions.filter((t) => t.type === "income");

    const expenseTotal = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const incomeTotal = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const incomeCategoryTotals = incomeTransactions.reduce((acc, t) => {
      const existing = acc.find((c) => c.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount, percentage: 0 });
      }
      return acc;
    }, [] as { name: string; value: number; percentage: number }[]);

    // Calculate percentages
    incomeCategoryTotals.forEach((cat) => {
      cat.percentage = incomeTotal ? (cat.value / incomeTotal) * 100 : 0;
    });

    // Sort by value descending
    incomeCategoryTotals.sort((a, b) => b.value - a.value);

    // Calculate category totals
    const categoryTotals = expenseTransactions.reduce((acc, t) => {
      const existing = acc.find((c) => c.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount, percentage: 0 });
      }
      return acc;
    }, [] as { name: string; value: number; percentage: number }[]);

    // Calculate percentages
    categoryTotals.forEach((cat) => {
      cat.percentage = expenseTotal ? (cat.value / expenseTotal) * 100 : 0;
    });

    // Sort by value descending
    categoryTotals.sort((a, b) => b.value - a.value);

    // Create daily flow data
    const dailyFlow = transactions.reduce((acc, t) => {
      const date = new Date(t.date).getDate().toString();
      const existing = acc.find((d) => d.date === date);
      const amount = t.type === "expense" ? -t.amount : t.amount;

      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({ date, amount });
      }
      return acc;
    }, [] as { date: string; amount: number }[]);

    // Sort by date
    dailyFlow.sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return {
      expense: expenseTotal,
      income: incomeTotal,
      total: incomeTotal - expenseTotal,
      expanseCategories: categoryTotals,
      dailyFlow,
      incomeCategories  : incomeCategoryTotals
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    throw error;
  }
};
