// app/(dashboard)/profile/page.tsx

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
} from "lucide-react";

interface UserPreferences {
  currency: string;
  defaultTransactionType: "income" | "expense";
  defaultPaymentMethod: "cash" | "card";
  cashBalance: number;
  theme: "light" | "dark";
}

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  // Add more currencies as needed
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "USD",
    defaultTransactionType: "expense",
    defaultPaymentMethod: "cash",
    cashBalance: 0,
    theme: "light",
  });

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState("");

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user?.username || "",
        email: user?.email || "",
      });
    }
  }, [user]);

  const handleUpdateInfo = async () => {
    try {
      setSavingInfo(true);
      setInfoError("");

      // Basic validation
      if (!userInfo.name.trim() || !userInfo.email.trim()) {
        setInfoError("Name and email are required");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userInfo.email)) {
        setInfoError("Please enter a valid email address");
        return;
      }

      const response = await fetch("/api/user/info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update information");
      }

      setIsEditingInfo(false);
      // You might want to update the user context here
    } catch (err) {
      setInfoError(err.message || "Failed to update information");
    } finally {
      setSavingInfo(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/preferences");
      if (!response.ok) throw new Error("Failed to fetch preferences");
      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      setError("Failed to load preferences");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error("Failed to update preferences");

      // Show success message or toast
    } catch (err) {
      setError("Failed to save preferences");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 w-full bg-white border-b border-slate-200">
        <div className="w-full px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Profile & Preferences
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full p-4">
        {/* Profile Section */}
        {/* <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-600" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-slate-900">
                {user?.name}
              </h2>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
        </div> */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-medium text-slate-900">
              Personal Information
            </h2>
            {!isEditingInfo && (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingInfo ? (
            <div className="space-y-4 flex ">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-600"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-600"
                  placeholder="your@email.com"
                />
              </div>

              {infoError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  {infoError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsEditingInfo(false);
                    setUserInfo({
                      name: user?.username || "",
                      email: user?.email || "",
                    });
                    setInfoError("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateInfo}
                  disabled={savingInfo}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                >
                  {savingInfo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Name
                </label>
                <p className="text-slate-900">{userInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  Email
                </label>
                <p className="text-slate-900">{userInfo.email}</p>
              </div>
            </div>
          )}
        </div>
        {/* Preferences Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-600"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Default Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Default Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    defaultTransactionType: "expense",
                  }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.defaultTransactionType === "expense"
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Expense
              </button>
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    defaultTransactionType: "income",
                  }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.defaultTransactionType === "income"
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Income
              </button>
            </div>
          </div>

          {/* Default Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Default Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    defaultPaymentMethod: "cash",
                  }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.defaultPaymentMethod === "cash"
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Cash
              </button>
              <button
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    defaultPaymentMethod: "card",
                  }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.defaultPaymentMethod === "card"
                    ? "border-green-600 bg-green-50 text-green-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Card
              </button>
            </div>
          </div>

          {/* Cash Balance */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Cash Balance
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="number"
                value={preferences.cashBalance}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    cashBalance: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full pl-10 p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-green-600"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, theme: "light" }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.theme === "light"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, theme: "dark" }))
                }
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  preferences.theme === "dark"
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-medium 
                     flex items-center justify-center gap-2 hover:bg-green-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
