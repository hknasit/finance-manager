"use clinet";
// components/TransactionDetails.tsx

import React from 'react';
import { Transaction } from '@/types/transaction';
import { X, Pencil, Trash2, CreditCard, Wallet } from "lucide-react";

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className={`p-6 ${transaction.type === "expense" ? "bg-red-600" : "bg-green-600"} text-white`}>
          <div className="flex justify-between items-start mb-6">
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex gap-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(transaction._id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Pencil className="w-6 h-6" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(transaction._id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {transaction.type === "expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
            </div>
            <div className="text-sm text-white/90">
              {new Date(transaction.date).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Account</div>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-700 font-medium">
              {transaction.paymentMethod === "card" ? (
                <CreditCard className="w-4 h-4" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {transaction.paymentMethod === "cash" ? "Cash" : "Card"}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-600 mb-2">Category</div>
            <div className="inline-flex items-center px-3 py-2 bg-slate-100 rounded-xl text-slate-700 font-medium">
              {transaction.category}
            </div>
          </div>

          {transaction.description && (
            <div>
              <div className="text-sm font-medium text-slate-600 mb-2">Description</div>
              <div className="text-slate-900">{transaction.description}</div>
            </div>
          )}

          {transaction.notes && (
            <div>
              <div className="text-sm font-medium text-slate-600 mb-2">Notes</div>
              <div className="text-slate-900">{transaction.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};