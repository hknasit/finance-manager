"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "card" | "cash";
}

export default function MonthlyTransactionsPage() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated, selectedDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/monthly/${year}/${month}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate((currentDate) => {
      const newDate = new Date(currentDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthYearDisplay = selectedDate.toLocaleString("en-CA", {
    month: "long",
    year: "numeric",
  });

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      "Credit Bill": "text-purple-600",
      Donation: "text-blue-600",
      Rent: "text-orange-600",
      Food: "text-green-600",
      Miscellaneous: "text-gray-600",
    };
    return colors[category] || "text-gray-600";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg">
        <div className="text-gray-600">
          Please log in to view your transactions.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-lg">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const totals = {
    income: transactions.reduce(
      (sum, t) => sum + (t.type === "income" ? t.amount : 0),
      0
    ),
    expense: transactions.reduce(
      (sum, t) => sum + (t.type === "expense" ? t.amount : 0),
      0
    ),
    net: transactions.reduce(
      (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
      0
    ),
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Monthly Transactions
            </h2>
            <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-1.5 w-full md:w-auto">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 px-4">
                <Calendar className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {monthYearDisplay}
                </span>
              </div>
              <button
                onClick={() => navigateMonth("next")}
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
                {formatCurrency(totals.income)}
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5" />
                <div className="text-sm text-white/90">Total Expenses</div>
              </div>
              <div className="text-xl md:text-2xl font-bold">
                {formatCurrency(totals.expense)}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5" />
                <div className="text-sm text-white/90">Net Amount</div>
              </div>
              <div
                className={`text-xl md:text-2xl font-bold ${
                  totals.net >= 0 ? "text-green-300" : "text-red-300"
                }`}
              >
                {formatCurrency(totals.net)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-6">
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="p-4 text-left text-sm font-semibold text-slate-600">
                      Date
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-600">
                      Description
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-slate-600">
                      Payment
                    </th>
                    <th className="p-4 text-right text-sm font-semibold text-slate-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-slate-600">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-900">
                        {transaction.description}
                      </td>
                      <td
                        className={`p-4 text-sm font-medium ${getCategoryColor(
                          transaction.category
                        )}`}
                      >
                        {transaction.category}
                      </td>
                      <td className="p-4 text-sm text-slate-600 capitalize">
                        {transaction.paymentMethod}
                      </td>
                      <td
                        className={`p-4 text-right text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No transactions found for {monthYearDisplay}
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction._id} className="p-4">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === transaction._id
                            ? null
                            : transaction._id
                        )
                      }
                      className="w-full"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {transaction.description}
                          </span>
                          <span className="text-sm text-slate-500">
                            {formatDate(transaction.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-semibold ${
                              transaction.type === "income"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}{" "}
                            {formatCurrency(transaction.amount)}
                          </span>
                          {expandedId === transaction._id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {expandedId === transaction._id && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 mb-1">
                            Category
                          </div>
                          <div
                            className={`text-sm font-medium ${getCategoryColor(
                              transaction.category
                            )}`}
                          >
                            {transaction.category}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <div className="text-xs text-slate-500 mb-1">
                            Payment Method
                          </div>
                          <div className="text-sm font-medium text-slate-700 capitalize flex items-center gap-2">
                            {transaction.paymentMethod === "card" ? (
                              <CreditCard className="w-4 h-4" />
                            ) : (
                              <Wallet className="w-4 h-4" />
                            )}
                            {transaction.paymentMethod}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
