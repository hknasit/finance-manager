/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  ArrowUpDown,
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  PencilIcon,
  Trash2,
  ImageIcon,
  ChevronRight,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  isProcessing: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onRowClick: (transaction: Transaction) => void;
}

export default function TransactionTable({
  transactions,
  loading,
  isProcessing,
  onEdit,
  onDelete,
  onRowClick,
}: TransactionTableProps) {
  const [sorting, setSorting] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile on component mount
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const columnHelper = createColumnHelper<Transaction>();

  const columns = [
    columnHelper.accessor("date", {
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Date</span>
        </div>
      ),
      cell: (info) => {
        const date = new Date(info.getValue());
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // getUTCMonth() returns 0-11
        const day = date.getUTCDate();
        
        return (
          <div className="text-sm text-slate-600">
            {`${day}/${month}/${year}`}
          </div>
        );
      },
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => (
        <div className="flex items-center gap-2">
          {info.row.original.image && (
            <ImageIcon className="w-4 h-4 text-blue-500" />
          )}
          <span className="text-sm font-medium text-slate-800 truncate max-w-[150px] md:max-w-none">
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
      // Hide on mobile
      meta: {
        hideOnMobile: true
      }
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {info.getValue()}
        </span>
      ),
      // Hide on mobile
      meta: {
        hideOnMobile: true
      }
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
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              onEdit(info.row.original);
            }}
            className="p-1 hover:bg-slate-100 rounded-lg"
            disabled={isProcessing}
          >
            <PencilIcon className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click event
              onDelete(info.row.original);
            }}
            className="p-1 hover:bg-red-100 rounded-lg"
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ),
      meta: {
        hideOnMobile: false
      }
    }),
  ];

  // Filter columns for mobile view
  const visibleColumns = isMobile 
    ? columns.filter(column => !(column.meta as any)?.hideOnMobile)
    : columns;

  const table = useReactTable({
    data: transactions,
    columns: visibleColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Mobile card view renderer
  const renderMobileCards = () => {
    if (transactions.length === 0) {
      return (
        <div className="py-8 px-4 text-center text-slate-500">
          No transactions found. Add a new transaction to get started.
        </div>
      );
    }

    return (
      <div className="space-y-3 p-2">
        {transactions.map((transaction) => (
          <div 
            key={transaction._id}
            className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
            onClick={() => onRowClick(transaction)}
          >
            <div className="p-3 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-2">
                {transaction.image && (
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm font-medium text-slate-800">
                  {transaction.description}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                  disabled={isProcessing}
                >
                  <PencilIcon className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(transaction);
                  }}
                  className="p-1 hover:bg-red-100 rounded-lg"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            
            <div className="p-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {transaction.category}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {transaction.paymentMethod === "card" ? (
                    <CreditCard className="w-3 h-3" />
                  ) : (
                    <Wallet className="w-3 h-3" />
                  )}
                  {transaction.paymentMethod}
                </span>
                <div className="flex items-center gap-1">
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
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button 
                className="text-xs text-slate-500 flex items-center gap-1"
                onClick={() => onRowClick(transaction)}
              >
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Desktop table renderer
  const renderDesktopTable = () => {
    return (
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
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 px-4 text-center text-slate-500"
                >
                  No transactions found. Add a new transaction to get started.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onRowClick(row.original)}
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
    );
  };

  if (loading) {
    return (
      <div className="text-center p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm mb-6">
        <div className="text-slate-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      {isMobile ? renderMobileCards() : renderDesktopTable()}
    </div>
  );
}