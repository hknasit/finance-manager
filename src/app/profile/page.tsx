/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  CheckCircle2,
  Loader2,
  Settings,
  Globe2,
  CreditCard,
  Wallet,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import CurrencyPreferences from "./CurrencyPreferences";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { updatePreferences, preferences } = useUserPreferences();

  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    defaultTransactionType: preferences?.defaultTransactionType || "expense",
    defaultPaymentMethod: preferences?.defaultPaymentMethod || "card",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updatePreferences({
        ...formData,
      });
      setSuccess("Profile updated successfully!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white p-4">
        <div className="text-center text-gray-600">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4 lg:p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center animate-slideDown">
            <span className="flex-1">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm flex items-center animate-slideDown">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span className="flex-1">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Settings className="w-4 h-4" />
                Account Settings
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-primary w-full"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full p-3 border rounded-xl bg-gray-50 text-gray-500"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Currency Preferences */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Globe2 className="w-4 h-4" />
                Currency Settings
              </div>
            </div>
            <div className="p-4">
              <CurrencyPreferences />
            </div>
          </div>

          {/* Transaction Preferences */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Receipt className="w-4 h-4" />
                Transaction Preferences
              </div>
            </div>
            <div className="p-4 space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Default Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultTransactionType: "income",
                      }))
                    }
                    className={`px-4 py-3 border rounded-xl transition-all ${
                      formData.defaultTransactionType === "income"
                        ? "bg-green-50 border-green-600 text-green-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownCircle
                        className={`w-5 h-5 ${
                          formData.defaultTransactionType === "income"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium">Income</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultTransactionType: "expense",
                      }))
                    }
                    className={`px-4 py-3 border rounded-xl transition-all ${
                      formData.defaultTransactionType === "expense"
                        ? "bg-green-50 border-green-600 text-green-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ArrowUpCircle
                        className={`w-5 h-5 ${
                          formData.defaultTransactionType === "expense"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium">Expense</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Default Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultPaymentMethod: "card",
                      }))
                    }
                    className={`px-4 py-3 border rounded-xl transition-all ${
                      formData.defaultPaymentMethod === "card"
                        ? "bg-green-50 border-green-600 text-green-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard
                        className={`w-5 h-5 ${
                          formData.defaultPaymentMethod === "card"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium">Card</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        defaultPaymentMethod: "cash",
                      }))
                    }
                    className={`px-4 py-3 border rounded-xl transition-all ${
                      formData.defaultPaymentMethod === "cash"
                        ? "bg-green-50 border-green-600 text-green-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Wallet
                        className={`w-5 h-5 ${
                          formData.defaultPaymentMethod === "cash"
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium">Cash</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}