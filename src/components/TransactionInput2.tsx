/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// TransactionInput.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Wallet,
  X,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoryContext";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import dayjs from "dayjs";
import type { CloudinaryAsset } from "@/types/cloudinary";
import type { Transaction } from "@/types/transaction";
import { useTransactions } from "@/contexts/TransactionContext";
import { ReceiptUpload } from "./ReceiptUpload";
import DatePicker from "./DatePicker";

interface TransactionInputProps {
  mode: "create" | "edit";
  initialData?: Transaction;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

interface FormState {
  type: "income" | "expense";
  paymentMethod: "card" | "cash";
  category: string;
  description: string;
  amount: string;
  date: Date;
  image: CloudinaryAsset | null;
}

export default function TransactionInput({
  mode,
  initialData,
  onClose,
  onSuccess,
}: TransactionInputProps) {
  const { isAuthenticated } = useAuth();
  const { categories } = useCategories();
  const { preferences } = useUserPreferences();
  const { updateTransaction, createTransaction } = useTransactions();
  const categoryRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormState>({
    type: initialData?.type || "expense",
    paymentMethod: initialData?.paymentMethod || "card",
    category: initialData?.category || "",
    description: initialData?.description || "",
    amount: initialData?.amount?.toString() || "",
    date: initialData?.date
      ? dayjs(initialData.date).toDate()
      : dayjs().toDate(),
    image: initialData?.image || null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    // Save original body style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const categoryList =
      formData.type === "expense" ? categories.expense : categories.income;
    if (categoryList.length > 0 && !formData.category) {
      setFormData((prev) => ({ ...prev, category: categoryList[0].name }));
    }
  }, [categories, formData.type, formData.category]);

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({ ...prev, date }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, amount: value }));
    }
  };

  const handleSave = async () => {
    try {
      if (!isAuthenticated) throw new Error("Please login first");
      if (!formData.description.trim()) throw new Error("Description required");
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error("Valid amount required");
      }

      setLoading(true);
      setError("");

      if (mode === "edit") {
        const body = {
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date.toISOString(),
          currentBankBalance: preferences.bankBalance,
          currentCashBalance: preferences.cashBalance,
        };
        await updateTransaction(initialData?._id, body);
      } else {
        const body = {
          ...formData,
          amount: parseFloat(formData.amount),
          date: formData.date.toISOString(),
          currentBankBalance: preferences.bankBalance,
          currentCashBalance: preferences.cashBalance,
        };
        const transaction = await createTransaction(body);
        onSuccess(transaction);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
      console.error("Transaction error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-start justify-center px-4 z-40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] mt-4 mb-20">
        {/* Header */}
        <div className="sticky top-0 p-3 flex justify-between items-center border-b border-slate-200 bg-white rounded-t-2xl z-10 shadow-md">
          <button
            onClick={onClose}
            disabled={loading}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <X size={18} />
            <span className="text-sm">Close</span>
          </button>
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1.5 px-3 py-1.5 hover:bg-green-50 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <Check size={18} />
            <span className="text-sm">
              {loading ? "Saving..." : mode === "create" ? "Save" : "Update"}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3.5">
            {/* Transaction Type - Styled like payment method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Transaction Type
              </label>
              <div className="flex gap-2">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl transition-colors ${
                      formData.type === t
                        ? "bg-green-50 border-green-600 text-green-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: t as "income" | "expense",
                        category: "", // Reset category when type changes
                      }))
                    }
                    disabled={loading}
                  >
                    <span className="text-sm">{t.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="flex gap-2">
                {[
                  { id: "card", icon: CreditCard, label: "Card" },
                  { id: "cash", icon: Wallet, label: "Cash" },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl transition-colors ${
                      formData.paymentMethod === id
                        ? "bg-green-50 border-green-600 text-green-700 font-medium"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: id as "card" | "cash",
                      }))
                    }
                    disabled={loading}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <button
                className="w-full flex items-center justify-between py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
                onClick={() => setShowCategories(!showCategories)}
                disabled={loading}
              >
                <span className="text-sm">{formData.category}</span>
                <ChevronDown size={18} />
              </button>

              {showCategories && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {(formData.type === "expense"
                      ? categories.expense
                      : categories.income
                    )
                      .filter((cat) =>
                        cat.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((cat) => (
                        <button
                          key={cat._id}
                          className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors text-sm ${
                            formData.category === cat.name
                              ? "text-green-600 font-medium bg-green-50"
                              : "text-slate-600"
                          }`}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              category: cat.name,
                            }));
                            setShowCategories(false);
                            setSearchTerm("");
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What's this for?"
                className="w-full py-2.5 px-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors text-slate-900 placeholder:text-slate-400"
                disabled={loading}
              />
            </div>

            {/* Image Upload */}
            <ReceiptUpload
              onChange={(asset) =>
                setFormData((prev) => ({ ...prev, image: asset }))
              }
              value={formData.image}
              disabled={loading}
            />

            {/* Date Picker */}
            <DatePicker
              selectedDate={formData.date}
              onChange={handleDateChange}
              disabled={loading}
            />

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-medium text-slate-900">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  style={{
                    appearance: "textfield",
                    WebkitAppearance: "textfield",
                    MozAppearance: "textfield",
                  }}
                  className="w-full pl-8 pr-3 py-2.5 text-right text-2xl font-medium border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors text-slate-900 placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}