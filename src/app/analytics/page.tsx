/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from "react";
import {
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
      <div className="text-center py-8 text-slate-600">
        No {type} data for this period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-80">
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
              label={({ percent }) =>
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
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((category) => (
          <div
            key={category.name}
            className="p-4 bg-white rounded-xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-lg"
                  style={{ backgroundColor: getCategoryColor(category.name) }}
                />
                <span className="font-medium text-slate-900">
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
              <div className="overflow-hidden h-2 text-xs flex rounded-lg bg-slate-100">
                <div
                  className={`rounded-lg ${
                    type === "expense" ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-sm text-slate-600">
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
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => `Day ${label}`}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
            }}
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 w-full bg-white border-b border-slate-200">
        <div className="w-full px-4 py-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {/* Expense Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  EXPENSE
                </span>
              </div>
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(data?.expense || 0)}
              </div>
            </div>

            {/* Income Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  INCOME
                </span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(data?.income || 0)}
              </div>
            </div>

            {/* Total Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <BadgeDollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  TOTAL
                </span>
              </div>
              <div
                className={`text-lg font-semibold ${
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
      <div className="w-full px-4 py-4">
        {/* View Selector */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowViewMenu(!showViewMenu)}
            className="w-full p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
          >
            <span className="font-medium text-slate-900">
              {selectedView === "expense-overview"
                ? "Expense Overview"
                : selectedView === "income-overview"
                ? "Income Overview"
                : "Transaction Flow"}
            </span>
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {showViewMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-sm z-20 overflow-hidden">
              {["expense-overview", "income-overview", "transaction-flow"].map(
                (view) => (
                  <button
                    key={view}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 text-slate-600"
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
                )
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {selectedView === "expense-overview" && (
            <CategoryBreakdown data={data?.expanseCategories} type="expense" />
          )}
          {selectedView === "income-overview" && (
            <CategoryBreakdown data={data?.incomeCategories} type="income" />
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
