/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,

} from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

const CategoryIcon = ({ type }: { type: string }) => (
  <div
    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      type === "income"
        ? "bg-green-50 text-green-600"
        : "bg-red-50 text-red-600"
    }`}
  >
    {type === "income" ? (
      <TrendingUp className="w-5 h-5" />
    ) : (
      <TrendingDown className="w-5 h-5" />
    )}
  </div>
);

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 animate-fadeIn">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryItem = ({
  category,
  onEdit,
  onDelete,
  activeMenu,
  setActiveMenu,
}) => {
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === category._id ? null : category._id);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(category);
    setActiveMenu(null);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(category);
    setActiveMenu(null);
  };

  return (
    <div className="flex items-center px-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4 flex-1">
        <CategoryIcon type={category.type} />
        <span className="text-base font-medium text-gray-900">
          {category.name}
        </span>
      </div>
      <div className="relative" data-menu-container>
        <button
          type="button"
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {activeMenu === category._id && (
          <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg z-10 py-1 min-w-[140px] border border-gray-200 animate-fadeIn">
            <button
              type="button"
              onClick={handleEditClick}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-600"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CategoryDialog = ({ open, onClose, initialData, onSubmit }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    if (open) {
      setName(initialData?.name || "");
      setType(initialData?.type || "expense");
    }
  }, [open, initialData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md animate-fadeIn">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {initialData ? "Edit Category" : "Add Category"}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  type === "income"
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setType("income")}
              >
                Income
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  type === "expense"
                    ? "bg-red-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setType("expense")}
              >
                Expense
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category Name"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-600 transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) onSubmit({ name: name.trim(), type });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={!name.trim()}
          >
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [dialog, setDialog] = useState({
    open: false,
    type: "add",
    data: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    category: null,
  });
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-menu-container]")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditCategory = (category) => {
    setDialog({
      open: true,
      type: "edit",
      data: category,
    });
    setActiveMenu(null);
  };

  const handleDeleteCategory = (category) => {
    setDeleteConfirm({
      open: true,
      category,
    });
    setActiveMenu(null);
  };

  const handleSubmit = async (data) => {
    try {
      if (dialog.type === "add") {
        await addCategory(data.name, data.type);
      } else if (dialog.data?._id) {
        await updateCategory(dialog.data._id, data.name, data.type);
      }
      setDialog({ open: false, type: "add", data: null });
    } catch (err) {
      console.error("Category operation failed:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.category?._id) {
        await deleteCategory(deleteConfirm.category._id);
        setDeleteConfirm({ open: false, category: null });
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-semibold text-gray-900" >Categories</h1>
            <div className="flex items-center gap-4">
              {/* <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button> */}
              <button
                onClick={() =>
                  setDialog({ open: true, type: "add", data: null })
                }
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                 Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Income Categories */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-3 px-1">
              Income Categories
            </h2>
            <div className="bg-white rounded-xl border border-gray-200">
              {categories.income.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              ))}
              {categories.income.length === 0 && (
                <div className="p-4 text-gray-500 text-center">
                  No income categories
                </div>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div>
            <h2 className="text-base font-medium text-gray-900 mb-3 px-1">
              Expense Categories
            </h2>
            <div className="bg-white rounded-xl border border-gray-200">
              {categories.expense.map((category) => (
                <CategoryItem
                  key={category._id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                />
              ))}
              {categories.expense.length === 0 && (
                <div className="p-4 text-gray-500 text-center">
                  No expense categories
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAB for mobile */}
      <button
        onClick={() => setDialog({ open: true, type: "add", data: null })}
        className="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 z-40"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* Dialogs */}
      <CategoryDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, type: "add", data: null })}
        initialData={dialog.data}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, category: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={
          <span>
            Are you sure you want to delete "{deleteConfirm.category?.name}"?
            This action cannot be undone.
          </span>
        }
      />
    </div>
  );
}
