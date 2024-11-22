// components/EditCategoryModal.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    _id: string;
    name: string;
    type: "income" | "expense";
  } | null;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateCategory } = useCategories();

  useEffect(() => {
    if (category && isOpen) {
      setName(category.name);
      setType(category.type);
      setError("");
    }
  }, [category, isOpen]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    try {
      setLoading(true);
      updateCategory(category._id, name, type);
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
          className="bg-white rounded-xl w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Edit Category
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

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
                    onClick={() => setType("income")}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      type === "income"
                        ? "bg-green-100 border-green-600 text-green-700 font-medium"
                        : "border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`flex-1 p-3 rounded-xl transition-colors ${
                      type === "expense"
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
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-green-600 transition-colors"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
