/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

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

export default function TransactionDashboard() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/summary/${year}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const jsonData = await response.json();

      // Initialize all months with zero values
      const allMonths = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        grossIncome: 0,
        monthlyExpense: 0,
        netIncome: 0,
        categories: {},
      }));

      // Merge fetched data with initialized months
      const mergedData = allMonths.map((emptyMonth) => {
        const monthData = jsonData.find(
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Calculate yearly totals
  const yearTotals = data.reduce(
    (acc, month) => ({
      income: acc.income + (month.grossIncome || 0),
      expense: acc.expense + (month.monthlyExpense || 0),
      net: acc.net + (month.netIncome || 0),
    }),
    { income: 0, expense: 0, net: 0 }
  );

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
        <div className="text-center text-slate-600">
          Please log in to view your transactions.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setYear(year - 1)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h2 className="text-xl font-semibold text-slate-900">{year}</h2>
              <button
                onClick={() => setYear(year + 1)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="px-4 py-4 grid grid-cols-3 gap-4 border-t border-slate-200">
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">
                EXPENSE
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(yearTotals.expense)}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">
                INCOME
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(yearTotals.income)}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">NET</div>
              <div
                className={`text-lg font-semibold ${
                  yearTotals.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(yearTotals.net)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-sm mt-4">
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="divide-y divide-slate-100">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 text-sm font-medium text-slate-600">
              <div className="grid grid-cols-5 items-center">
                <div className="col-span-1">Month</div>
                <div className="col-span-1 text-right">Income</div>
                <div className="col-span-1 text-right">Expense</div>
                <div className="col-span-2 text-right pr-8">Net Amount</div>
              </div>
            </div>

            {data.map((month) => (
              <div key={month.month}>
                <button
                  onClick={() =>
                    setExpandedMonth(
                      expandedMonth === month.month ? null : month.month
                    )
                  }
                  className="w-full hover:bg-slate-50 transition-colors"
                >
                  <div className="px-4 py-3">
                    <div className="grid grid-cols-5 items-center">
                      <div className="col-span-1">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              month.netIncome >= 0
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium text-slate-900">
                            {getMonthName(month.month)}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 text-right text-green-600 font-medium">
                        {formatCurrency(month.grossIncome)}
                      </div>
                      <div className="col-span-1 text-right text-red-600 font-medium">
                        {formatCurrency(month.monthlyExpense)}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <div
                          className={`font-semibold ${
                            month.netIncome >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(month.netIncome)}
                        </div>
                        <div className="w-8 flex justify-center">
                          {expandedMonth === month.month ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded View for Desktop */}
                {expandedMonth === month.month && (
                  <div className="p-4 bg-slate-50 animate-slideDown">
                    <div className="grid grid-cols-12 gap-4">
                      {/* Income & Expense Summary */}
                      <div className="col-span-4 space-y-3">
                        <div className="p-4 bg-white rounded-xl">
                          <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                          <div className="text-xs text-green-600 font-medium mb-1">
                            Total Income
                          </div>
                          <div className="text-lg font-semibold text-green-700">
                            {formatCurrency(month.grossIncome)}
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl">
                          <TrendingDown className="w-5 h-5 text-red-600 mb-2" />
                          <div className="text-xs text-red-600 font-medium mb-1">
                            Total Expenses
                          </div>
                          <div className="text-lg font-semibold text-red-700">
                            {formatCurrency(month.monthlyExpense)}
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      <div className="col-span-8 space-y-2">
                        <div className="text-sm font-medium text-slate-600 mb-3">
                          Expense Categories
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {categories.expense.map((category) => (
                            <div
                              key={category._id}
                              className="flex items-center justify-between p-3 bg-white rounded-xl"
                            >
                              <span className="text-sm text-slate-600">
                                {category.name}
                              </span>
                              <span className="font-medium text-slate-900">
                                {formatCurrency(
                                  month.categories[category.name] || 0
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Yearly Total Row */}
            <div className="bg-slate-50 px-4 py-3">
              <div className="grid grid-cols-5 items-center font-semibold">
                <div className="col-span-1 text-slate-900">Total</div>
                <div className="col-span-1 text-right text-green-700">
                  {formatCurrency(yearTotals.income)}
                </div>
                <div className="col-span-1 text-right text-red-700">
                  {formatCurrency(yearTotals.expense)}
                </div>
                <div className="col-span-2 text-right pr-8">
                  <span
                    className={
                      yearTotals.net >= 0 ? "text-green-700" : "text-red-700"
                    }
                  >
                    {formatCurrency(yearTotals.net)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile View */}
      <div className="md:hidden divide-y divide-slate-100">
        {data.map((month) => (
          <div key={month.month} className="overflow-hidden">
            <button
              onClick={() =>
                setExpandedMonth(
                  expandedMonth === month.month ? null : month.month
                )
              }
              className="w-full p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      month.netIncome >= 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="font-medium text-slate-900">
                    {getMonthName(month.month)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`text-sm font-semibold ${
                      month.netIncome >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(month.netIncome)}
                  </div>
                  {expandedMonth === month.month ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </button>

            {expandedMonth === month.month && (
              <div className="p-4 pt-0 space-y-4 animate-slideDown">
                {/* Income/Expense Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
                    <div className="text-xs text-green-600 font-medium mb-1">
                      Total Income
                    </div>
                    <div className="text-lg font-semibold text-green-700">
                      {formatCurrency(month.grossIncome)}
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <TrendingDown className="w-5 h-5 text-red-600 mb-2" />
                    <div className="text-xs text-red-600 font-medium mb-1">
                      Total Expenses
                    </div>
                    <div className="text-lg font-semibold text-red-700">
                      {formatCurrency(month.monthlyExpense)}
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-600">
                    Categories
                  </div>
                  {categories.expense.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <span className="text-sm text-slate-600">
                        {category.name}
                      </span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(month.categories[category.name] || 0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Net Amount */}
                <div className="p-4 bg-slate-100 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-slate-600" />
                    <div className="text-sm text-slate-600 font-medium">
                      Net Amount
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      month.netIncome >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(month.netIncome)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
