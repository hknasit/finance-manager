/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  Wallet,
  Plus,
  TrendingDown,
  TrendingUp,
  CircleDollarSign,
  BadgeDollarSign,
} from "lucide-react";
import { TransactionDetails } from "./TransactionDetails";
import { FilterPanel } from "./FilterPanel";
import { useCategories } from "@/contexts/CategoryContext";
import TransactionInput2 from "@/components/TransactionInput";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: "card" | "cash";
  notes?: string;
}

interface FilterState {
  type: "all" | "income" | "expense";
  category: string;
  paymentMethod: "all" | "card" | "cash";
  startDate: string;
  endDate: string;
}

export default function MonthlyTransactionsView() {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    category: "all",
    paymentMethod: "all",
    startDate: "",
    endDate: "",
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { categories } = useCategories();
  const { formatAmount, getCurrencySymbol } = useUserPreferences();

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
      console.log("Fetched transactions:", data.transactions);
      setTransactions(data || []); // Provide default empty array
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current transactions:", transactions);
    console.log("Filtered transactions:", filteredTransactions);
    console.log("Grouped transactions:", groupedTransactions);
  }, [transactions, filters]);

  // Filter transactions with improved logging
  const filteredTransactions = transactions.filter((transaction) => {
    if (!transaction) {
      console.log("Found null transaction");
      return false;
    }

    // Log each filter condition
    const typeMatch =
      filters.type === "all" || transaction.type === filters.type;
    const categoryMatch =
      filters.category === "all" || transaction.category === filters.category;
    const paymentMatch =
      filters.paymentMethod === "all" ||
      transaction.paymentMethod === filters.paymentMethod;

    let dateMatch = true;
    if (filters.startDate) {
      dateMatch =
        dateMatch && new Date(transaction.date) >= new Date(filters.startDate);
    }
    if (filters.endDate) {
      dateMatch =
        dateMatch && new Date(transaction.date) <= new Date(filters.endDate);
    }

    console.log(`Transaction ${transaction._id} matches:`, {
      typeMatch,
      categoryMatch,
      paymentMatch,
      dateMatch,
    });

    return typeMatch && categoryMatch && paymentMatch && dateMatch;
  });

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

  // Filter transactions with null check

  // Group transactions by date with null check
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      if (!transaction) return groups;

      try {
        const date = new Date(transaction.date);
        if (isNaN(date.getTime())) {
          console.error("Invalid date for transaction:", transaction);
          return groups;
        }

        const dateKey = date.toISOString().split("T")[0];
        const formattedDate = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        if (!groups[dateKey]) {
          groups[dateKey] = {
            formattedDate,
            transactions: [],
          };
        }
        groups[dateKey].transactions.push(transaction);

        // Sort transactions within each day by date (newest first)
        groups[dateKey].transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        return groups;
      } catch (error) {
        console.error("Error processing transaction:", transaction, error);
        return groups;
      }
    },
    {}
  );
  const sortedGroupedTransactions = Object.entries(groupedTransactions)
    .sort(([dateKeyA], [dateKeyB]) => {
      const dateA = new Date(dateKeyA);
      const dateB = new Date(dateKeyB);
      return dateB.getTime() - dateA.getTime();
    })
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  // Calculate totals with null check
  const totals = filteredTransactions.reduce(
    (acc, t) => ({
      income: acc.income + (t?.type === "income" ? t.amount : 0),
      expense: acc.expense + (t?.type === "expense" ? t.amount : 0),
    }),
    { income: 0, expense: 0 }
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
      <div className="sticky top-0 z-20 w-full bg-white border-b border-slate-200">
        <div className="w-full px-4 py-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedDate.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Filter className="w-5 h-5" />
              {(filters.type !== "all" ||
                filters.category !== "all" ||
                filters.paymentMethod !== "all" ||
                filters.startDate ||
                filters.endDate) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {/* Expense Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  EXPENSE
                </span>
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatAmount(totals.expense)}
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  INCOME
                </span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatAmount(totals.income)}
              </div>
            </div>

            {/* Total Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <BadgeDollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  TOTAL
                </span>
              </div>
              <div
                className={`text-lg font-semibold ${
                  totals.income - totals.expense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatAmount(totals.income - totals.expense)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List - Removed extra spacing */}
      <div className="bg-white w-full">
        {!transactions.length ? (
          <div className="py-12 text-center text-slate-500">
            <BadgeDollarSign className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p>No transactions for this month</p>
          </div>
        ) : !filteredTransactions.length ? (
          <div className="py-12 text-center text-slate-500">
            No transactions match the selected filters
          </div>
        ) : (
          <div>
            {Object.entries(sortedGroupedTransactions).map(
              ([dateKey, { formattedDate, transactions }]: any) => (
                <div key={dateKey}>
                  <div className="sticky top-[120px] px-4 py-2 bg-slate-50 border-y border-slate-200 z-10">
                    <div className="text-sm font-medium text-slate-700">
                      {formattedDate}
                    </div>
                  </div>
                  <div>
                    {transactions.map((transaction: Transaction) => (
                      <button
                        key={transaction._id}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="w-full px-4 py-3 flex items-center hover:bg-slate-50 transition-all border-b border-slate-100 last:border-b-0"
                      >
                        {/* Icon */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                            transaction.type === "expense"
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {transaction.type === "expense" ? (
                            <TrendingDown className="w-5 h-5" />
                          ) : (
                            <TrendingUp className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="ml-3 flex-1 flex items-center justify-between min-w-0">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="font-medium text-slate-900 truncate">
                              {transaction.description || transaction.category}
                            </span>
                            {/* Desktop view tags */}
                            <div className="hidden sm:flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                                {transaction.paymentMethod === "card" ? (
                                  <CreditCard className="w-3 h-3" />
                                ) : (
                                  <Wallet className="w-3 h-3" />
                                )}
                                {transaction.paymentMethod}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                                {transaction.category}
                              </span>
                            </div>
                            {/* Mobile view tags */}
                            <div className="flex sm:hidden flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                  {transaction.paymentMethod === "card" ? (
                                    <CreditCard className="w-3 h-3" />
                                  ) : (
                                    <Wallet className="w-3 h-3" />
                                  )}
                                  {transaction.paymentMethod}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                  {transaction.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`ml-3 text-base font-semibold whitespace-nowrap ${
                              transaction.type === "expense"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {transaction.type === "expense" ? "-" : "+"}
                            { formatAmount(transaction.amount)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowTransactionForm(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Modals */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50">
          <div className="fixed inset-0 overflow-y-auto">
            <div className="min-h-full">
              <TransactionInput2
                setShowForm={setShowTransactionForm}
                setTransactions={setTransactions}
              />
            </div>
          </div>
        </div>
      )}

      {showFilters && (
        <FilterPanel
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
        />
      )}

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
