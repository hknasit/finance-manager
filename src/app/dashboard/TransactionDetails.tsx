/* eslint-disable @typescript-eslint/no-explicit-any */
// components/Dashboard/TransactionDetails.tsx
"use client";
import React, { useState, useRef } from "react";
import {
  X,
  Pencil,
  Trash2,
  CreditCard,
  Wallet,
  Tag,
  FileText,
  Clock,
  ZoomIn,
  Download,
  ExternalLink,
} from "lucide-react";
import { Transaction } from "@/types/transaction";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { CldImage } from "next-cloudinary";

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
  const [showFullImage, setShowFullImage] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full max-w-md h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Fixed Header */}
        <div
          className={`absolute top-0 left-0 right-0 z-10 px-6 pt-6 pb-8 ${
            transaction.type === "expense" ? "bg-red-600" : "bg-green-600"
          } text-white rounded-t-2xl`}
        >
          <div className="flex justify-between items-start mb-8">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-5 h-5" />
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
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold mb-1">
              {transaction.type === "expense" ? "-" : "+"}
              {formatAmount(transaction.amount)}
            </div>
            <div className="text-sm text-white/90">
              {new Date(transaction.date).toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="h-full pt-[160px] pb-[80px] overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-3">
              {transaction.paymentMethod === "card" ? (
                <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
              ) : (
                <Wallet className="w-5 h-5 text-slate-400 mt-0.5" />
              )}
              <div>
                <div className="text-sm text-slate-500">Payment Method</div>
                <div className="text-slate-900 mt-0.5 capitalize">
                  {transaction.paymentMethod}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-3">
              <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm text-slate-500">Category</div>
                <div className="text-slate-900 mt-0.5">
                  {transaction.category}
                </div>
              </div>
            </div>

            {transaction.description && (
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-sm text-slate-500">Description</div>
                  <div className="text-slate-900 mt-0.5">
                    {transaction.description}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors -mx-3">
              <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <div className="text-sm text-slate-500">Date & Time</div>
                <div className="text-slate-900 mt-0.5">
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

            {transaction.notes && (
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-2">Notes</div>
                <div className="text-slate-600 whitespace-pre-wrap p-3 bg-slate-50 rounded-lg">
                  {transaction.notes}
                </div>
              </div>
            )}

            {transaction?.image && (
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-2">Receipt</div>
                <div className="flex items-start gap-3">
                  <div className="relative group">
                    <CldImage
                      width="120"
                      height="120"
                      src={transaction.image.publicId}
                      alt="Receipt thumbnail"
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                      onClick={() => setShowFullImage(true)}
                    />
                    <button
                      onClick={() => setShowFullImage(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() =>
                        handleDownload(
                          transaction.image!.url,
                          `receipt-${transaction._id}.jpg`
                        )
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <a
                      href={transaction.image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open original</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full p-3 text-center text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col"
          onClick={(e) => {
            if (e.target === modalRef.current) setShowFullImage(false);
          }}
        >
          {/* Fixed Modal Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white/90 text-sm line-clamp-1">
              {transaction.description}
            </div>
            <div className="flex items-center gap-2">
              <a
                href={transaction.image!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={() =>
                  handleDownload(
                    transaction.image!.url,
                    `receipt-${transaction._id}.jpg`
                  )
                }
                className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowFullImage(false)}
                className="p-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
              </div>
            )}
            <CldImage
              width="1600"
              height="1200"
              src={transaction.image!.publicId}
              alt="Receipt"
              className="max-h-full w-auto object-contain rounded-lg shadow-2xl"
              sizes="(max-width: 1600px) 90vw, 1600px"
              onLoad={() => setIsImageLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
