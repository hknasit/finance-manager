"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Transaction } from "@/types/transaction";
import { DashboardHeader } from "./DashboardHeader";
import TransactionInput from "@/components/TransactionInput2";
import { TransactionDetails } from "./TransactionDetails";
import ResponsiveFilter from "./ResponsiveFilter";
import TransactionTable from "./TransactionTable";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  const {
    transactions,
    loading,
    filters,
    setFilters,
    deleteTransaction,
    applyFilters,
    clearFilters,
  } = useTransactions();

  // Local UI states
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        setIsProcessing(true);
        await deleteTransaction(transaction._id);
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle row click to show transaction details
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleTransactionSuccess = async () => {
    try {
      setIsProcessing(true);
      // Force a refresh of the transaction data
      
      setShowTransactionForm(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Failed to refresh transactions:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // The filter control components to be passed to ResponsiveFilter
  const filterControls = (
    <>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Type
        </label>
        <select
          value={filters.type}
          onChange={(e) =>
            setFilters({ ...filters, type: e.target.value })
          }
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-green-500"
          disabled={isProcessing}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
          Payment Method
        </label>
        <select
          value={filters.paymentMethod}
          onChange={(e) =>
            setFilters({
              ...filters,
              paymentMethod: e.target.value,
            })
          }
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-green-500"
          disabled={isProcessing}
        >
          <option value="all">All Methods</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
          From
        </label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-green-500"
          disabled={isProcessing}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
          To
        </label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-green-500"
          disabled={isProcessing}
        />
      </div>
    </>
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

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader onAddTransaction={() => setShowTransactionForm(true)} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Panel */}
        <ResponsiveFilter 
          onApply={applyFilters}
          onClear={clearFilters}
          isProcessing={isProcessing}
          isLoading={loading}
        >
          {filterControls}
        </ResponsiveFilter>

        {/* Transaction Table (Now using the extracted component) */}
        <TransactionTable 
          transactions={transactions}
          loading={loading}
          isProcessing={isProcessing}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleRowClick}
        />
      </div>

      {/* Modals */}
      {showTransactionForm && (
        <TransactionInput
          mode={selectedTransaction ? "edit" : "create"}
          initialData={selectedTransaction || undefined}
          onClose={() => {
            setShowTransactionForm(false);
            setSelectedTransaction(null);
          }}
          onSuccess={handleTransactionSuccess}
        />
      )}

      {showDetails && selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => {
            setShowDetails(false);
            setSelectedTransaction(null);
          }}
          onEdit={(transaction) => {
            setShowDetails(false);
            setSelectedTransaction(transaction);
            setShowTransactionForm(true);
          }}
          onDelete={async (transactionId) => {
            try {
              setIsProcessing(true);
              setShowDetails(false);
              await deleteTransaction(transactionId);
            } catch (error) {
              console.error("Failed to delete transaction:", error);
              alert("Failed to delete transaction. Please try again.");
            } finally {
              setIsProcessing(false);
              setSelectedTransaction(null);
            }
          }}
        />
      )}
    </div>
  );
}