// contexts/TransactionContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import { Transaction, FilterState, TransactionTotals } from "@/types/transaction";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  hasMore: boolean;
  limit: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  totals: TransactionTotals;
  pagination: PaginationData;
  
  // Actions
  setFilters: (filters: FilterState) => void;
  fetchTransactions: (reset?: boolean) => Promise<void>;
  createTransaction: (transactionData: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  applyFilters: () => Promise<void>;
  clearFilters: () => void;
}

const defaultPagination: PaginationData = {
  currentPage: 1,
  totalPages: 1,
  totalTransactions: 0,
  hasMore: false,
  limit: 25
};

const defaultFilters: FilterState = {
  type: "all",
  category: "all",
  paymentMethod: "all",
  startDate: "",
  endDate: "",
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true );
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>(defaultPagination);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [totals, setTotals] = useState<TransactionTotals>({
    income: 0,
    expense: 0,
  });

  // Fetch transactions with filters and pagination
  const fetchTransactions = async (reset: boolean = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : pagination.currentPage;

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.paymentMethod !== "all" && { paymentMethod: filters.paymentMethod }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      console.log('Fetching with params:', queryParams.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      // Update transactions based on reset flag
      if (reset) {
        setTransactions(data.transactions);
      } else {
        setTransactions(prev => [...prev, ...data.transactions]);
      }
      
      // Update pagination and totals
      setPagination(data.pagination);
      setTotals(data.totals);
      setError(null);
      return data;
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      if (reset) {
        setTransactions([]);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load more transactions (pagination)
  const loadMoreTransactions = async () => {
    if (!pagination.hasMore || loading) return;
    setPagination(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1
    }));
    await fetchTransactions(false);
  };

  // Apply current filters
  const applyFilters = async () => {
    await fetchTransactions(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Create new transaction
  const createTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create transaction');
      }

      const newTransaction = await response.json();
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete transaction
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
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const value = {
    transactions,
    loading,
    error,
    filters,
    totals,
    pagination,
    setFilters,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadMoreTransactions,
    applyFilters,
    clearFilters,
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