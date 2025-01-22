/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { X, TrendingUp, TrendingDown } from "lucide-react";

interface CategoryTotals {
  [category: string]: number;
}

interface MonthlyData {
  month: number;
  grossIncome: number;
  monthlyExpense: number;
  netIncome: number;
  categories: CategoryTotals;
}

const MonthDetailsModal = ({
  month,
  year,

  categories,
  formatCurrency,
  onClose,
}: {
  month: MonthlyData | null;
  year: number;
  data: MonthlyData[];
  categories: any;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
}) => {
  if (!month) return null;

  const getMonthName = (monthNum: number): string => {
    return new Date(2000, monthNum - 1).toLocaleString("default", {
      month: "long",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getMonthName(month.month)} {year}
            </h3>
            <div
              className={`text-sm ${
                month.netIncome >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              Net Balance: {formatCurrency(month.netIncome)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Total Income
                </span>
              </div>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(month.grossIncome)}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Total Expenses
                </span>
              </div>
              <div className="text-xl font-bold text-red-700">
                {formatCurrency(month.monthlyExpense)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Income Categories
              </h4>
              <div className="space-y-2">
                {categories.income.map((category: any) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-600">{category.name}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(month.categories[category.name] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Expense Categories
              </h4>
              <div className="space-y-2">
                {categories.expense.map((category: any) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-600">{category.name}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(month.categories[category.name] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthDetailsModal;
