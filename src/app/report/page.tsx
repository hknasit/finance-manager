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
    categories: [], // Array for multiple categories
    paymentMethod: "all",
  });

  // Filter categories based on selected type
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
          headers: {
            "Content-Type": "application/json",
          },
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

  // Handle category selection
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
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
          <p className="text-gray-800 mt-1 text-base">
            Export your transactions to Excel
          </p>
        </div>

        {/* Filters Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-4">
            <label className="block text-lg text-gray-900 font-medium">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base text-gray-800 mb-2">
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
                  className="w-full p-3 border text-base rounded-lg focus:outline-none focus:border-green-600 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-base text-gray-800 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                  className="w-full p-3 border text-base rounded-lg focus:outline-none focus:border-green-600  text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-lg text-gray-900 font-medium mb-2">
              Transaction Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  type: e.target.value,
                  categories: [], // Reset categories when type changes
                }));
              }}
              className="w-full p-3 border text-base rounded-lg focus:outline-none focus:border-green-600  text-gray-600"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Categories */}
          {filters.type !== "all" && (
            <div>
              <label className="block text-lg text-gray-900 font-medium mb-3">
                {filters.type === "income"
                  ? "Income Categories"
                  : "Expense Categories"}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCategories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat.name)}
                      onChange={() => handleCategoryChange(cat.name)}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-base text-gray-800">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-lg text-gray-900 font-medium mb-2">
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
              className="w-full p-3 border text-base rounded-lg focus:outline-none focus:border-green-600  text-gray-600"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-base bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-4 px-6 bg-green-600 text-white rounded-lg text-lg font-medium 
                     flex items-center justify-center gap-3 hover:bg-green-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Download size={24} />
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
