/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { fetchMonthlyAnalytics } from "@/lib/services/analytics.service";

// Add more colors as needed
const CATEGORY_COLORS = {
  Food: "#FF6B6B",
  Education: "#4169E1",
  Clothing: "#FFA500",
  Shopping: "#1E90FF",
  Transportation: "#FF69B4",
};

const getCategoryColor = (category: string) => {
  return (
    CATEGORY_COLORS[category] ||
    "#" + Math.floor(Math.random() * 16777215).toString(16)
  );
};

const formatCurrency = (amount: number) => {
  return `$${Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Separate component for category breakdown
const CategoryBreakdown = ({ data, type }) => {
  if (!data?.length) {
    return (
      <div className="text-center py-8 text-gray-800">
        No {type} data for this period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-80 -mx-4 md:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              labelLine={false}
              label={({ name, percent }) =>
                percent > 0.05 ? `${(percent * 100).toFixed(1)}%` : ""
              }
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={getCategoryColor(entry.name)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend and Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((category) => (
          <div
            key={category.name}
            className="p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category.name) }}
                />
                <span className="font-medium text-gray-900">
                  {category.name}
                </span>
              </div>
              <span
                className={`font-medium ${
                  type === "expense" ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatCurrency(category.value)}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                <div
                  className={`rounded-full ${
                    type === "expense" ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-sm font-medium text-gray-900">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Combined Flow Chart component
const CombinedFlowChart = ({ data }) => {
  if (!data?.length) {
    return (
      <div className="text-center py-8 text-gray-800">
        No transaction data for this period
      </div>
    );
  }

  // Process data to separate income and expense
  const processedData = Object.values(
    data.reduce((acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          expense: 0,
          income: 0,
        };
      }
      if (curr.amount < 0) {
        acc[date].expense += Math.abs(curr.amount);
      } else {
        acc[date].income += curr.amount;
      }
      return acc;
    }, {})
  );

  return (
    <div className="h-96 bg-white p-4 rounded-lg shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 4 }}
            activeDot={{ r: 6 }}
            name="Expense"
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 4 }}
            activeDot={{ r: 6 }}
            name="Income"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const AnalyticsPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState("expense-overview");
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const analyticsData = await fetchMonthlyAnalytics(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1
        );
        setData(analyticsData);
        setError("");
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-800">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() =>
                setSelectedDate((d) => {
                  const newDate = new Date(d);
                  newDate.setMonth(newDate.getMonth() - 1);
                  return newDate;
                })
              }
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedDate.toLocaleDateString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() =>
                setSelectedDate((d) => {
                  const newDate = new Date(d);
                  newDate.setMonth(newDate.getMonth() + 1);
                  return newDate;
                })
              }
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 text-center border-t">
            <div>
              <div className="text-sm font-medium text-gray-800">EXPENSE</div>
              <div className="text-red-600 font-semibold">
                {formatCurrency(data?.expense || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">INCOME</div>
              <div className="text-green-600 font-semibold">
                {formatCurrency(data?.income || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">TOTAL</div>
              <div
                className={`font-semibold ${
                  data?.total >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(data?.total || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* View Selector */}
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="w-full p-4 bg-white rounded-lg shadow-sm flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">
                {selectedView === "expense-overview"
                  ? "Expense Overview"
                  : selectedView === "income-overview"
                  ? "Income Overview"
                  : "Transaction Flow"}
              </span>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {showViewMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-20">
                {[
                  "expense-overview",
                  "income-overview",
                  "transaction-flow",
                ].map((view) => (
                  <button
                    key={view}
                    className="w-full p-4 text-left hover:bg-gray-50 text-gray-600"
                    onClick={() => {
                      setSelectedView(view);
                      setShowViewMenu(false);
                    }}
                  >
                    {view === "expense-overview"
                      ? "Expense Overview"
                      : view === "income-overview"
                      ? "Income Overview"
                      : "Transaction Flow"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {selectedView === "expense-overview" && (
            <CategoryBreakdown data={data?.expanseCategories} type="expense" />
          )}
          {selectedView === "income-overview" && (
            <CategoryBreakdown
              data={data?.incomeCategories}
              type="income"
            />
          )}
          {selectedView === "transaction-flow" && (
            <CombinedFlowChart data={data?.dailyFlow} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
