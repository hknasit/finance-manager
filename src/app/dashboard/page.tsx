/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState , useEffect} from "react";
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  PencilIcon,
  Trash2,
  ImageIcon,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { Transaction } from "@/types/transaction";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DashboardHeader } from "./DashboardHeader";
import TransactionInput from "@/components/TransactionInput2";
import { TransactionDetails } from "./TransactionDetails";
import MobileFilter from "./MobileFilter";

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
    fetchTransactions,
  } = useTransactions();

  // Local UI states
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [sorting, setSorting] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const columnHelper = createColumnHelper<Transaction>();

  const columns = [
    // ... columns remain the same
    columnHelper.accessor("date", {
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Date</span>
        </div>
      ),
      cell: (info) => (
        <div className="text-sm text-slate-600">
          {new Date(info.getValue()).toLocaleDateString()}
        </div>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => (
        <div className="flex items-center gap-2">
          {info.row.original.image && (
            <ImageIcon className="w-4 h-4 text-blue-500" />
          )}
          <span className="text-sm font-medium text-slate-800">
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("paymentMethod", {
      header: "Payment",
      cell: (info) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {info.getValue() === "card" ? (
            <CreditCard className="w-3 h-3" />
          ) : (
            <Wallet className="w-3 h-3" />
          )}
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("amount", {
      header: () => (
        <div className="text-right flex items-center justify-end gap-2">
          <span>Amount</span>
          <ArrowUpDown className="w-3 h-3" />
        </div>
      ),
      cell: (info) => {
        const transaction = info.row.original;
        return (
          <div className="text-right flex items-center justify-end gap-1">
            <DollarSign
              className={`w-4 h-4 ${
                transaction.type === "income"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {Math.abs(info.getValue()).toFixed(2)}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex items-center justify-end gap-2 ">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleEdit(info.row.original);
            }}
            className="p-1 hover:bg-slate-100 rounded-lg"
            disabled={isProcessing}
          >
            <PencilIcon className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              handleDelete(info.row.original);
            }}
            className="p-1 hover:bg-red-100 rounded-lg"
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Filter Panel */}
        <MobileFilter>
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 mb-6 max-w-min">
            <div className="flex flex-col items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  disabled={isProcessing}
                >
                  Clear
                </button>
                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    await applyFilters();
                    setIsProcessing(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  disabled={isProcessing || loading}
                >
                  <Check className="w-4 h-4" />
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value as any })
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
                      paymentMethod: e.target.value as any,
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
            </div>
          </div>
        </MobileFilter>

        {/* Loading Indicator */}
        {loading ? (
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm mb-6">
            <div className="text-slate-600">Loading transactions...</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-slate-200 bg-slate-50/50"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="text-left py-3 px-4 text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {transactions.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="py-8 px-4 text-center text-slate-500"
                      >
                        No transactions found. Add a new transaction to get
                        started.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => handleRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
              await fetchTransactions(true);
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
