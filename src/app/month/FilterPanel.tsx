"use clinet";
// components/FilterPanel.tsx

import React, { useEffect } from "react";
import { X, Check, CreditCard, Wallet } from "lucide-react";
import { FilterState } from "@/types/transaction";
import { useCategories } from "@/contexts/CategoryContext";

interface FilterPanelProps {
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onClose,
  filters,
  setFilters,
}) => {
  const { categories } = useCategories();
  const [filterCategory, setFilterCategory] = React.useState(
    filters.category === "all"
      ? [...categories.income, ...categories.expense]
      : filters.category === "income"
      ? categories.income
      : categories.expense
  );
  /**
   * Resets the filters to their default state and closes the filter panel.
   * The default state is: all types, all categories, all payment methods, and no dates.
   */
  const resetFilters = () => {
    setFilters({
      type: "all",
      category: "all",
      paymentMethod: "all",
      startDate: "",
      endDate: "",
    });
    onClose();
  };

  useEffect(() => {
    setFilterCategory(
      filters.category === "all"
        ? [...categories.income, ...categories.expense]
        : filters.category === "income"
        ? categories.income
        : categories.expense
    );
  }, [categories, filters.category]);

  function handleCategoryChange(type: "income" | "expense" | "all") {
    setFilterCategory(
      type === "all"
        ? [...categories.income, ...categories.expense]
        : type === "income"
        ? categories.income
        : categories.expense
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-25">
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["all", "income", "expense"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    handleCategoryChange(type as "all" | "income" | "expense");
                    setFilters({
                      ...filters,
                      type: type as FilterState["type"],
                    });
                  }}
                  className={`p-2 text-sm rounded-lg capitalize ${
                    filters.type === type
                      ? "bg-green-100 text-green-700 font-medium border border-green-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["all", "card", "cash"].map((method) => (
                <button
                  key={method}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      paymentMethod: method as FilterState["paymentMethod"],
                    })
                  }
                  className={`p-2 text-sm rounded-lg capitalize flex items-center justify-center gap-1 ${
                    filters.paymentMethod === method
                      ? "bg-green-100 text-green-700 font-medium border border-green-600"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent"
                  }`}
                >
                  {method === "card" ? (
                    <CreditCard className="w-4 h-4" />
                  ) : method === "cash" ? (
                    <Wallet className="w-4 h-4" />
                  ) : null}
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:border-green-600 transition-colors outline-none"
            >
              <option value="all">All Categories</option>
              {filterCategory?.map((category) => (
                <option key={category?._id} value={category?.name}>
                  {category?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                className="p-3 border border-slate-200 rounded-xl text-slate-900 focus:border-green-600 transition-colors outline-none"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                className="p-3 border border-slate-200 rounded-xl text-slate-900 focus:border-green-600 transition-colors outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={resetFilters}
              className="p-3 text-center text-slate-700 font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-3 text-center text-white font-medium bg-green-600 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
