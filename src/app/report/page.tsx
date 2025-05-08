"use client";
import React, { useState } from "react";
import { Download } from "lucide-react";
import { useCategories } from "@/contexts/CategoryContext";


const ReportPage = () => {
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    type: "all",
    category: "all",
    categories: [],
    paymentMethod: "all",
  });

  const filteredCategories =
    categories[filters.type === "income" ? "income" : "expense"] || [];

  const handleExport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/reports/export`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filters),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${filters.startDate}-to-${filters.endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      setError(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 m-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Generate Report
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Transaction Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type: e.target.value,
                  categories: [],
                }))
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Categories */}
          {filters.type !== "all" && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                {filters.type === "income"
                  ? "Income Categories"
                  : "Expense Categories"}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCategories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat.name)}
                      onChange={() => handleCategoryChange(cat.name)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <span className="text-sm text-gray-900">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-600 text-gray-900"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg text-sm font-medium 
                     flex items-center justify-center gap-2 hover:bg-green-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Download className="w-5 h-5" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
