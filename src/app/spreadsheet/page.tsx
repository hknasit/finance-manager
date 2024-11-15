"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Wallet, CreditCard, Gift, Home, Coffee, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';


interface MonthlyData {
  month: number;
  grossIncome: number;
  creditBill: number;
  donation: number;
  rent: number;
  food: number;
  miscellaneous: number;
  monthlyExpense: number;
  netIncome: number;
}

export default function TransactionDashboard() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/summary/${year}`);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const jsonData = await response.json();
      console.log("Fetched data:", jsonData);

      // Initialize all months with zero values
      const allMonths = Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        grossIncome: 0,
        creditBill: 0,
        donation: 0,
        rent: 0,
        food: 0,
        miscellaneous: 0,
        monthlyExpense: 0,
        netIncome: 0,
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
    return amount.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow">
        <div className="text-slate-600">
          Please log in to view your transactions.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const totals = {
    grossIncome: data.reduce((sum, month) => sum + month.grossIncome, 0),
    creditBill: data.reduce((sum, month) => sum + month.creditBill, 0),
    donation: data.reduce((sum, month) => sum + month.donation, 0),
    rent: data.reduce((sum, month) => sum + month.rent, 0),
    food: data.reduce((sum, month) => sum + month.food, 0),
    miscellaneous: data.reduce((sum, month) => sum + month.miscellaneous, 0),
    monthlyExpense: data.reduce((sum, month) => sum + month.monthlyExpense, 0),
    netIncome: data.reduce((sum, month) => sum + month.netIncome, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Financial Summary
            </h2>
            <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-1.5 w-full md:w-auto">
              <button
                onClick={() => setYear(year - 1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xl font-semibold px-4">{year}</span>
              <button
                onClick={() => setYear(year + 1)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" />
                <div className="text-sm text-white/90">Total Income</div>
              </div>
              <div className="text-xl md:text-2xl font-bold">
                {formatCurrency(totals.grossIncome)}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5" />
                <div className="text-sm text-white/90">Total Expenses</div>
              </div>
              <div className="text-xl md:text-2xl font-bold">
                {formatCurrency(totals.monthlyExpense)}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5" />
                <div className="text-sm text-white/90">Net Income</div>
              </div>
              <div
                className={`text-xl md:text-2xl font-bold ${
                  totals.netIncome >= 0 ? "text-green-300" : "text-red-300"
                }`}
              >
                {formatCurrency(totals.netIncome)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-6">
          <div className="bg-white rounded-2xl shadow-lg divide-y divide-slate-100">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left p-4 text-sm font-semibold text-slate-600">
                      Month
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Income
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Credit
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Donation
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Rent
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Food
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Misc
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Expenses
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-slate-600">
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((month) => (
                    <tr
                      key={month.month}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {getMonthName(month.month)}
                      </td>
                      <td className="p-4 text-right text-emerald-600 font-medium">
                        {formatCurrency(month.grossIncome)}
                      </td>
                      <td className="p-4 text-right text-orange-600">
                        {formatCurrency(month.creditBill)}
                      </td>
                      <td className="p-4 text-right text-violet-600">
                        {formatCurrency(month.donation)}
                      </td>
                      <td className="p-4 text-right text-blue-600">
                        {formatCurrency(month.rent)}
                      </td>
                      <td className="p-4 text-right text-amber-600">
                        {formatCurrency(month.food)}
                      </td>
                      <td className="p-4 text-right text-pink-600">
                        {formatCurrency(month.miscellaneous)}
                      </td>
                      <td className="p-4 text-right font-medium text-slate-900">
                        {formatCurrency(month.monthlyExpense)}
                      </td>
                      <td
                        className={`p-4 text-right font-medium ${
                          month.netIncome >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(month.netIncome)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold">
                    <td className="p-4 text-slate-900">Total</td>
                    <td className="p-4 text-right text-emerald-700">
                      {formatCurrency(totals.grossIncome)}
                    </td>
                    <td className="p-4 text-right text-orange-700">
                      {formatCurrency(totals.creditBill)}
                    </td>
                    <td className="p-4 text-right text-violet-700">
                      {formatCurrency(totals.donation)}
                    </td>
                    <td className="p-4 text-right text-blue-700">
                      {formatCurrency(totals.rent)}
                    </td>
                    <td className="p-4 text-right text-amber-700">
                      {formatCurrency(totals.food)}
                    </td>
                    <td className="p-4 text-right text-pink-700">
                      {formatCurrency(totals.miscellaneous)}
                    </td>
                    <td className="p-4 text-right text-slate-900">
                      {formatCurrency(totals.monthlyExpense)}
                    </td>
                    <td
                      className={`p-4 text-right ${
                        totals.netIncome >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {formatCurrency(totals.netIncome)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Table View */}
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
                          month.netIncome >= 0
                            ? "text-green-600"
                            : "text-red-600"
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
                    {/* Main Income/Expense Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-emerald-50 rounded-xl">
                        <Wallet className="w-5 h-5 text-emerald-600 mb-2" />
                        <div className="text-xs text-emerald-600 font-medium mb-1">
                          Income
                        </div>
                        <div className="text-lg font-semibold text-emerald-700">
                          {formatCurrency(month.grossIncome)}
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl">
                        <CreditCard className="w-5 h-5 text-orange-600 mb-2" />
                        <div className="text-xs text-orange-600 font-medium mb-1">
                          Credit Bill
                        </div>
                        <div className="text-lg font-semibold text-orange-700">
                          {formatCurrency(month.creditBill)}
                        </div>
                      </div>
                    </div>

                    {/* Expense Categories */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-violet-50 rounded-xl">
                        <Gift className="w-5 h-5 text-violet-600 mb-2" />
                        <div className="text-xs text-violet-600 font-medium mb-1">
                          Donation
                        </div>
                        <div className="text-sm font-semibold text-violet-700">
                          {formatCurrency(month.donation)}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <Home className="w-5 h-5 text-blue-600 mb-2" />
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          Rent
                        </div>
                        <div className="text-sm font-semibold text-blue-700">
                          {formatCurrency(month.rent)}
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl">
                        <Coffee className="w-5 h-5 text-amber-600 mb-2" />
                        <div className="text-xs text-amber-600 font-medium mb-1">
                          Food
                        </div>
                        <div className="text-sm font-semibold text-amber-700">
                          {formatCurrency(month.food)}
                        </div>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-xl">
                        <MoreHorizontal className="w-5 h-5 text-pink-600 mb-2" />
                        <div className="text-xs text-pink-600 font-medium mb-1">
                          Miscellaneous
                        </div>
                        <div className="text-sm font-semibold text-pink-700">
                          {formatCurrency(month.miscellaneous)}
                        </div>
                      </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="p-4 bg-slate-100 rounded-xl">
                      <div className="text-sm text-slate-600 font-medium mb-1">
                        Total Expenses
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {formatCurrency(month.monthlyExpense)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
