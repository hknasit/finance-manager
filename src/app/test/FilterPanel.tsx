// components/Dashboard/FilterPanel.tsx
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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.getElementById('filter-panel');
      if (panel && !panel.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm">
      <div 
        id="filter-panel"
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg animate-slide-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Filter Options */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-8rem)]">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["all", "income", "expense"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters({
                    ...filters,
                    type: type as FilterState["type"],
                  })}
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
                  onClick={() => setFilters({
                    ...filters,
                    paymentMethod: method as FilterState["paymentMethod"],
                  })}
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
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-green-600 transition-colors outline-none"
            >
              <option value="all">All Categories</option>
              <optgroup label="Income">
                {categories.income.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expense">
                {categories.expense.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-green-600 transition-colors outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:border-green-600 transition-colors outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
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