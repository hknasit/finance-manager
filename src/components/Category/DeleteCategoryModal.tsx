/* eslint-disable react/no-unescaped-entities */
// components/DeleteCategoryModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    _id: string;
    name: string;
  } | null;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
}: DeleteCategoryModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const { deleteCategory } = useCategories();
  if (!isOpen || !category) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      deleteCategory(category._id);

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
              Delete Category
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4">
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{category.name}"? This action
              cannot be undone.
            </p>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 p-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
