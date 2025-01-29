// contexts/TransactionContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Transaction, FilterState, TransactionTotals } from "@/types/transaction";

interface Balances {
  cashBalance: number;
  bankBalance: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedDate: Date;
  filters: FilterState;
  totals: TransactionTotals;
  page: number;
  hasMore: boolean;
  balances: Balances;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setFilters: (filters: FilterState) => void;
  fetchTransactions: (reset?: boolean) => Promise<void>;
  createTransaction: (transactionData: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  navigateMonth: (direction: "prev" | "next") => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [balances, setBalances] = useState<Balances>({
    cashBalance: 0,
    bankBalance: 0
  });
  
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    category: "all",
    paymentMethod: "all",
    startDate: "",
    endDate: "",
  });

  const [totals, setTotals] = useState<TransactionTotals>({
    income: 0,
    expense: 0,
  });

  const fetchTransactions = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const currentPage = reset ? 1 : page;

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '25',
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.paymentMethod !== 'all' && { paymentMethod: filters.paymentMethod }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/monthly/${year}/${month}?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      
      if (reset) {
        setTransactions(data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.transactions]);
      }
      
      setTotals(data.totals);
      setHasMore(data.pagination.hasMore);
      setPage(currentPage);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          currentCashBalance: balances.cashBalance,
          currentBankBalance: balances.bankBalance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create transaction');
      }

      const data = await response.json();
      setBalances(data.balances);
      setTransactions(prev => [data.transaction, ...prev]);
      await fetchTransactions(true); // Refresh the list
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transactionData,
          currentCashBalance: balances.cashBalance,
          currentBankBalance: balances.bankBalance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update transaction');
      }

      const data = await response.json();
      setBalances(data.balances);
      setTransactions(prev =>
        prev.map(t => t._id === id ? data.transaction : t)
      );
      await fetchTransactions(true); // Refresh the list
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete transaction');
      }

      const data = await response.json();
      setBalances(data.balances);
      setTransactions(prev => prev.filter(t => t._id !== id));
      await fetchTransactions(true); // Refresh the list
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
    await fetchTransactions();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate(currentDate => {
      const newDate = new Date(currentDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Reset page and fetch new data when filters or selected date changes
  useEffect(() => {
    fetchTransactions(true);
  }, [filters, selectedDate]);

  const value = {
    transactions,
    loading,
    error,
    selectedDate,
    filters,
    totals,
    page,
    hasMore,
    balances,
    setSelectedDate,
    setFilters,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadMoreTransactions,
    navigateMonth,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
}