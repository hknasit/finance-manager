// components/Dashboard/TransactionDetails.tsx
import React from "react";
import {
  X,
  Pencil,
  Trash2,
  CreditCard,
  Wallet,
  Tag,
  FileText,
  Clock,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transactionId: string) => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { formatAmount } = useUserPreferences();

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-scale">
          {/* Header */}
          <div
            className={`relative p-6 ${
              transaction.type === "expense" ? "bg-red-600" : "bg-green-600"
            } text-white`}
          >
            {/* Actions */}
            <div className="flex justify-between items-start mb-8">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Pencil className="w-6 h-6" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this transaction?"
                        )
                      ) {
                        onDelete(transaction._id);
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {transaction.type === "expense" ? "-" : "+"}
                {formatAmount(transaction.amount)}
              </div>
              <div className="text-sm opacity-90">
                {new Date(transaction.date).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Payment Method */}
            <div className="flex items-center gap-3">
              {transaction.paymentMethod === "card" ? (
                <CreditCard className="w-5 h-5 text-slate-400" />
              ) : (
                <Wallet className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="text-sm text-slate-500">Payment Method</div>
                <div className="text-slate-900 font-medium capitalize">
                  {transaction.paymentMethod}
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Category</div>
                <div className="text-slate-900 font-medium">
                  {transaction.category}
                </div>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-500">Description</div>
                  <div className="text-slate-900">
                    {transaction.description}
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-500">Date & Time</div>
                <div className="text-slate-900">
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

            {/* Notes if any */}
            {transaction.notes && (
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-2">Notes</div>
                <div className="text-slate-600 whitespace-pre-wrap">
                  {transaction.notes}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={onClose}
              className="w-full p-3 text-center text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
