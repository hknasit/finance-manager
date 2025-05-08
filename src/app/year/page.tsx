/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  Wallet,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import MonthDetailsModal from "./YearModel";

interface CategoryTotals {
  [category: string]: number;
}

interface MonthlyData {
  month: number;
  grossIncome: number;
  monthlyExpense: number;
  netIncome: number;
  categories: CategoryTotals;
}

interface BalanceData {
  bankBalance: number;
  cashBalance: number;
}

// Modal Component

export default function YearOverview() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const { formatAmount, preferences } = useUserPreferences();

  const [balances, setBalances] = useState<BalanceData>({
    bankBalance: preferences.bankBalance || 0,
    cashBalance: preferences.cashBalance || 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<MonthlyData | null>(null);

  const { isAuthenticated } = useAuth();
  const { categories } = useCategories();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/summary/${year}`
        ),
      ]);

      if (!transactionsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const transactionData = await transactionsResponse.json();
      //   const balanceData = await balancesResponse.json();

      const allMonths = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        grossIncome: 0,
        monthlyExpense: 0,
        netIncome: 0,
        categories: {},
      }));

      const mergedData = allMonths.map((emptyMonth) => {
        const monthData = transactionData.find(
          (item: MonthlyData) => item.month === emptyMonth.month
        );
        return monthData || emptyMonth;
      });

      setData(mergedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number): string => {
    return new Date(2000, month - 1).toLocaleString("default", {
      month: "long",
    });
  };

  const formatCurrency = (amount: number): string => {
    return formatAmount(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="text-center text-gray-600">
          Please log in to view your transactions.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">Year Summary</h1>
            </div>
            {/* Year Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setYear(year - 1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">{year}</h2>
                <button
                  onClick={() => setYear(year + 1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Months Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((month) => (
            <div
              key={month.month}
              className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => setSelectedMonth(month)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  {getMonthName(month.month)} {year}
                </h3>
                <div
                  className={`px-2 py-1 rounded-full text-sm ${
                    month.netIncome >= 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {formatCurrency(month.netIncome)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Income</div>
                  <div className="text-sm font-medium text-green-600">
                    {formatCurrency(month.grossIncome)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Expense</div>
                  <div className="text-sm font-medium text-red-600">
                    {formatCurrency(month.monthlyExpense)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Month Details Modal */}
      {selectedMonth && (
        <MonthDetailsModal
          month={selectedMonth}
          year={year}
          data={data}
          categories={categories}
          formatCurrency={formatCurrency}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </div>
  );
}
