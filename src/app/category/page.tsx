/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, Pencil, Trash2, DollarSign } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";

const CategoryIcon = ({ type }: { type: string }) => (
  <div
    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
      type === "income" ? "bg-green-600" : "bg-red-600"
    }`}
  >
    <DollarSign size={24} />
  </div>
);

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(category);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <div className="flex items-center gap-4 flex-1">
        <CategoryIcon type={category.type} />
        <span className="text-lg text-gray-900">{category.name}</span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={handleMenuClick}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
        >
          <MoreVertical size={20} />
        </button>
        {activeMenu === category._id && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
            <button
              type="button"
              onClick={handleEditClick}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2  text-gray-600"
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <Trash2 size={16} />
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

  useEffect(() => {
    if (!open) {
      setName("");
      setType("expense");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {initialData ? "Edit Category" : "Add Category"}
          </h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  type === "income"
                    ? "bg-green-600 text-white"
                    : "border border-gray-300  text-gray-600"
                }`}
                onClick={() => setType("income")}
              >
                Income
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  type === "expense"
                    ? "bg-red-600 text-white"
                    : "border border-gray-300  text-gray-600"
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
              className="w-full p-2 border rounded-lg outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-gray-100  text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSubmit({ name: name.trim(), type });
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside of any menu
      if (!event.target.closest(".category-menu")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditCategory = (category) => {
    setDialog({ open: true, type: "edit", data: category });
  };

  const handleDeleteCategory = (category) => {
    setDeleteConfirm({ open: true, category });
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
      if (deleteConfirm.category) {
        await deleteCategory(deleteConfirm.category._id);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteConfirm({ open: false, category: null });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setDialog({ open: true, type: "add", data: null })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Income Categories
        </h2>
        <div className="bg-white rounded-lg shadow-sm category-menu">
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
            <div className="p-4 text-gray-600 text-center">
              No income categories
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Expense Categories
        </h2>
        <div className="bg-white rounded-lg shadow-sm category-menu">
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
            <div className="p-4 text-gray-600 text-center">
              No expense categories
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setDialog({ open: true, type: "add", data: null })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
      >
        <Plus size={24} />
      </button>

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
          <span className="text-gray-700">
            Are you sure you want to delete "{deleteConfirm.category?.name}"?
            This action cannot be undone.
          </span>
        }
      />
    </div>
  );
}
