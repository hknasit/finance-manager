/* eslint-disable @typescript-eslint/no-unused-vars */
// components/AddCategoryModal.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: "income" | "expense";
}

export function AddCategoryModal({
  isOpen,
  onClose,
  defaultType,
}: AddCategoryModalProps) {
  const { addCategory } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const [categoryType, setCategoryType] = useState(defaultType);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewCategory("");
      setCategoryType(defaultType);
      setError("");
    }
  }, [isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      setError("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      await addCategory(newCategory.trim(), categoryType);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/25 z-50" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-xl w-full max-w-sm relative animate-in fade-in slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Add New Category
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              {/* Category Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryType("income")}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      categoryType === "income"
                        ? "bg-green-100 border-green-600 text-green-700 font-medium"
                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryType("expense")}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      categoryType === "expense"
                        ? "bg-green-100 border-green-600 text-green-700 font-medium"
                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter category name"
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-6 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 font-medium transition-colors"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
