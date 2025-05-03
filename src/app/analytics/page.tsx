/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart,
  Wallet,
  CreditCard,
  Plus,
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
import { fetchMonthlyAnalytics, AnalyticsData } from "@/lib/services/analytics.service";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import { useRouter } from "next/navigation";

// Consistent color scheme for categories
const CATEGORY_COLORS = {
  Food: "#FF6B6B",
  Education: "#4169E1",
  Clothing: "#FFA500",
  Shopping: "#1E90FF",
  Transportation: "#FF69B4",
  Salary: "#22c55e",
  Investments: "#10B981",
  "Side Hustle": "#60A5FA",
  Gifts: "#8B5CF6",
  Other: "#6B7280",
};

// Generate consistent colors for categories
const getCategoryColor = (category: string, index: number = 0) => {
  // Use predefined color if available
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  // Generate a consistent color based on the category name
  // This ensures the same category always gets the same color
  const hash = category.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const hue = hash % 360;
  const saturation = 70 + (hash % 20);
  const lightness = 45 + (hash % 10);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Category Breakdown Component - Memoized
const CategoryBreakdown = React.memo(({ data, type }: { data: any[], type: string }) => {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No {type} data available for this period
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Container */}
      <div className="p-4 bg-white rounded-xl border border-gray-200">
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
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={getCategoryColor(entry.name, index)} />
                ))}
              </Pie>
              <Tooltip 
              //@ts-ignore
                formatter={(value) => value.toFixed(2)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  padding: "12px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((category, index) => (
          <div
            key={category.name}
            className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-lg"
                  style={{ backgroundColor: getCategoryColor(category.name, index) }}
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
                {category.value.toFixed(2)}
              </span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded-lg bg-gray-100">
                <div
                  className={`rounded-lg ${
                    type === "expense" ? "bg-red-600" : "bg-green-600"
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <div className="text-right mt-1">
                <span className="text-sm text-gray-500">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Flow Chart Component - Memoized
const CombinedFlowChart = React.memo(({ data }: { data: any[] }) => {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No transaction data available for this period
      </div>
    );
  }

  // Calculate daily income and expense
  const processedData = data.map(item => ({
    date: item.date,
    expense: item.amount < 0 ? Math.abs(item.amount) : 0,
    income: item.amount > 0 ? item.amount : 0
  }));

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              formatter={(value) => Number(value).toFixed(2)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "12px",
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
    </div>
  );
});

// Ensure display names are set for memo components
CategoryBreakdown.displayName = 'CategoryBreakdown';
CombinedFlowChart.displayName = 'CombinedFlowChart';

const AnalyticsPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedView, setSelectedView] = useState("transaction-flow");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  
  const { preferences, formatAmount } = useUserPreferences();

  // Fetch analytics data whenever selected date changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const analyticsData = await fetchMonthlyAnalytics(
          selectedDate.getFullYear(),
          selectedDate.getMonth() + 1
        );
        
        setData(analyticsData);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  // Handle month navigation
  const handleMonthChange = (increment: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  // Handle new transaction button click
  const handleAddTransaction = () => {
    router.push('/dashboard');
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <h1 className="text-xl font-semibold">Dashboard Overview</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium text-gray-900 min-w-[140px] text-center">
                  {selectedDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Cash:</span>
                    <span className="ml-2 text-gray-900">
                      {formatAmount(preferences.cashBalance)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Bank:</span>
                    <span className="ml-2 text-gray-900">
                      {formatAmount(preferences.bankBalance)}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleAddTransaction}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Add Transaction</span>
                <span className="md:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* View Selection Tabs */}
            <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedView("transaction-flow")}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedView === "transaction-flow"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <LineChartIcon className="w-5 h-5" />
                <span>Flow</span>
              </button>
              <button
                onClick={() => setSelectedView("expense-overview")}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedView === "expense-overview"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <PieChartIcon className="w-5 h-5" />
                <span>Expenses</span>
              </button>
              <button
                onClick={() => setSelectedView("income-overview")}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedView === "income-overview"
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <BarChart className="w-5 h-5" />
                <span>Income</span>
              </button>
            </div>

            {/* Chart Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
              {selectedView === "expense-overview" && (
                <CategoryBreakdown
                  data={data?.expanseCategories || []}
                  type="expense"
                />
              )}
              {selectedView === "income-overview" && (
                <CategoryBreakdown
                  data={data?.incomeCategories || []}
                  type="income"
                />
              )}
              {selectedView === "transaction-flow" && (
                <CombinedFlowChart data={data?.dailyFlow || []} />
              )}
            </div>
          </div>
          
          {/* Sidebar Summary */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Expense</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatAmount(data?.expense || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Income</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatAmount(data?.income || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BadgeDollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Balance</p>
                  <p
                    className={`text-xl font-bold ${
                      (data?.total || 0) >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatAmount(data?.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;