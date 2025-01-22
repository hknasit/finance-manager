// components/Dashboard/Dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { Transaction, FilterState } from "@/types/transaction";
import { DashboardHeader } from "./DashboardHeader";
import { MonthlyOverview } from "./MonthlyOverview";
import { TransactionTable } from "./TransactionTable";
import { TransactionDetails } from "./TransactionDetails";
import { FilterPanel } from "./FilterPanel";
import TransactionInput from "@/components/TransactionInput";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    category: "all",
    paymentMethod: "all",
    startDate: "",
    endDate: "",
  });

//   const [showTransactionForm, setShowTransactionForm] = useState(false);
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
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader 
        onShowFilters={() => setShowFilters(true)}
        onAddTransaction={() => setShowTransactionForm(true)}
        filters={filters}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-2">
        <MonthlyOverview 
          selectedDate={selectedDate}
          onNavigateMonth={navigateMonth}
          totals={totals}
          formatAmount={formatAmount}
        />
        
        <TransactionTable 
          transactions={filteredTransactions}
          onSelectTransaction={setSelectedTransaction}
          formatAmount={formatAmount}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {/* Modals */}
      {showTransactionForm && (
        <TransactionInput
          setShowForm={setShowTransactionForm}
          setTransactions={setTransactions}
        />
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