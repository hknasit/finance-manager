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
} from "lucide-react";
import { TransactionDetails } from "./TransactionDetails";
import { FilterPanel } from "./FilterPanel";
import { useCategories } from "@/contexts/CategoryContext";
import TransactionInput2 from "@/components/TransactionInput";

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

    // console.log(`Transaction ${transaction._id} matches:`, {
    //   typeMatch,
    //   categoryMatch,
    //   paymentMatch,
    //   dateMatch,
    // });

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
    <div className="min-h-screen bg-slate-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600" />
              </button>
              <h2 className="text-xl font-semibold text-slate-900">
                {selectedDate.toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-slate-600" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative"
            >
              <Filter className="w-6 h-6 text-slate-600" />
              {(filters.type !== "all" ||
                filters.category !== "all" ||
                filters.paymentMethod !== "all" ||
                filters.startDate ||
                filters.endDate) && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Summary */}
          <div className="px-4 py-4 grid grid-cols-3 gap-4 border-t border-slate-200">
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">
                EXPENSE
              </div>
              <div className="text-lg font-semibold text-red-600">
                ${totals.expense.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">
                INCOME
              </div>
              <div className="text-lg font-semibold text-green-600">
                ${totals.income.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-medium text-slate-500 mb-1">
                TOTAL
              </div>
              <div
                className={`text-lg font-semibold ${
                  totals.income - totals.expense >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${(totals.income - totals.expense).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-w-2xl mx-auto bg-white shadow-sm mt-4">
        {!transactions.length ? (
          <div className="py-12 text-center text-slate-500">
            No transactions for this month
          </div>
        ) : !filteredTransactions.length ? (
          <div className="py-12 text-center text-slate-500">
            No transactions match the selected filters
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {Object.entries(sortedGroupedTransactions).map(
              //@ts-ignore
              ([dateKey, { formattedDate, transactions }]) => (
                <div key={dateKey}>
                  <div className="sticky top-[137px] px-4 py-3 bg-slate-100 border-y border-slate-200 z-10">
                    <div className="text-sm font-medium text-slate-700">
                      {formattedDate}
                    </div>
                  </div>
                  <div>
                    {transactions.map((transaction: Transaction) => (
                      <button
                        key={transaction._id}
                        className="w-full px-4 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <div className="flex flex-col items-start">
                          <div className="font-medium text-slate-900 mb-1">
                            {transaction.description || transaction.category}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                              {transaction.paymentMethod === "card" ? (
                                <CreditCard className="w-3 h-3" />
                              ) : (
                                <Wallet className="w-3 h-3" />
                              )}
                              {transaction.paymentMethod}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                              {transaction.category}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`text-base font-semibold ${
                            transaction.type === "expense"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "expense" ? "-" : "+"}$
                          {transaction.amount.toLocaleString()}
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
      {/* Floating Action Button for adding new transaction */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setShowTransactionForm(true)}
          className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Transaction Form Modal */}
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
      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
        />
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
