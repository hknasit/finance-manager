// contexts/TransactionContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  Transaction,
  FilterState,
  TransactionTotals,
} from "@/types/transaction";
import { useUserPreferences } from "./UserPreferencesContext";
import { useAuth } from "./AuthContext";

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
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  applyFilters: () => Promise<void>;
  clearFilters: () => Promise<void>;
}

const defaultPagination: PaginationData = {
  currentPage: 1,
  totalPages: 1,
  totalTransactions: 0,
  hasMore: false,
  limit: 25,
};

const defaultFilters: FilterState = {
  type: "all",
  category: "all",
  paymentMethod: "all",
  startDate: "",
  endDate: "",
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>(defaultPagination);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [totals, setTotals] = useState<TransactionTotals>({
    income: 0,
    expense: 0,
  });
  
  const { setPreferences } = useUserPreferences();
  const { isAuthenticated } = useAuth();

  // Build API URL with query parameters
  const buildApiUrl = useCallback((currentFilters: FilterState, page: number, limit: number): string => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(currentFilters.type !== "all" && { type: currentFilters.type }),
      ...(currentFilters.category !== "all" && { category: currentFilters.category }),
      ...(currentFilters.paymentMethod !== "all" && { paymentMethod: currentFilters.paymentMethod }),
      ...(currentFilters.startDate && { startDate: currentFilters.startDate }),
      ...(currentFilters.endDate && { endDate: currentFilters.endDate }),
    });

    return `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions?${queryParams}`;
  }, []);

  // Fetch transactions with filters and pagination - memoized with useCallback
  const fetchTransactions = useCallback(async (reset: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      const currentPage = reset ? 1 : pagination.currentPage;
      
      const apiUrl = buildApiUrl(filters, currentPage, pagination.limit);
      console.log("Fetching with URL:", apiUrl);

      const response = await fetch(apiUrl);

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
  }, [filters, pagination.currentPage, pagination.limit, buildApiUrl]);

  // Load more transactions (pagination) - memoized
  const loadMoreTransactions = useCallback(async (): Promise<void> => {
    if (!pagination.hasMore || loading) return;
    
    setPagination(prev => ({
      ...prev,
      currentPage: prev.currentPage + 1,
    }));
    
    await fetchTransactions(false);
  }, [pagination.hasMore, loading, fetchTransactions]);

  // Apply current filters - memoized
  const applyFilters = useCallback(async (): Promise<void> => {
    await fetchTransactions(true);
  }, [fetchTransactions]);

  // Clear all filters - memoized
  const clearFilters = useCallback(async (): Promise<void> => {
    // Set the filters state
    setFilters(defaultFilters);
    
    // Directly build query without relying on filter state
    const apiUrl = buildApiUrl(defaultFilters, 1, pagination.limit);
    
    try {
      setLoading(true);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data = await response.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
      setTotals(data.totals);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, buildApiUrl]);

  // Create new transaction - memoized
  const createTransaction = useCallback(async (transactionData: Partial<Transaction>): Promise<Transaction> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create transaction");
      }

      const data = await response.json();
      
      // Update preferences
      setPreferences(prev => ({
        ...prev,
        bankBalance: data.balances.bankBalance,
        cashBalance: data.balances.cashBalance,
      }));
      
      // Update transactions - sort by date
      setTransactions(prev => 
        [...prev, data.transaction].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
      
      return data.transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setPreferences]);

  // Update transaction - memoized
  const updateTransaction = useCallback(async (
    id: string,
    transactionData: Partial<Transaction>
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update transaction");
      }

      const { transaction: updatedTransaction } = await response.json();

      // Update transactions - sort by date
      setTransactions(prev =>
        prev
          .map(t => t._id === id ? updatedTransaction : t)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete transaction - memoized
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/transactions/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete transaction");
      }

      // Remove deleted transaction from state
      setTransactions(prev => prev.filter(transaction => transaction._id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    fetchTransactions(true).catch(err => {
      console.error("Failed to fetch initial transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    });
  }, [isAuthenticated, fetchTransactions]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
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
    clearFilters
  ]);

  return (
    <TransactionContext.Provider value={contextValue}>
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