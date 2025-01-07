/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";
import {
  User,
  CreditCard,
  Wallet,
  DollarSign,
  ChevronLeft,
  Globe,
  Settings,
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
    cashBalance: preferences?.cashBalance || 0,
    bankBalance: preferences?.bankBalance || 0,
    defaultTransactionType: preferences?.defaultTransactionType || "expense",
    defaultPaymentMethod: preferences?.defaultPaymentMethod || "card",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updatePreferences({
        ...formData,
      });

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-4">
        <div className="text-center text-slate-600">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

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
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-slate-900">
                Profile Settings
              </h2>
            </div>
          </div>

          {/* Profile Summary */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">NAME</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate">
                {formData.name}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  BALANCE
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                ${formData.cashBalance + formData.bankBalance}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-slate-600">
                  CURRENCY
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {preferences.currency}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-xl text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Basic Info Section */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-900 mb-4">
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-slate-900 mb-4">
                Preferences
              </h3>

              <div className="space-y-4">
                <CurrencyPreferences />
                <div className="p-4">
                  <h3 className="text-sm font-medium text-slate-900 mb-4">
                    Balance Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Cash Balance
                      </label>
                      <input
                        type="number"
                        value={formData.cashBalance}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            cashBalance: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-600 mb-1">
                        Bank Balance
                      </label>
                      <input
                        type="number"
                        value={formData.bankBalance}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            bankBalance: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full p-3 border border-slate-200 rounded-xl focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">
                    Default Transaction Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["income", "expense"].map((type: "income" | "expense") => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            defaultTransactionType: type,
                          }))
                        }
                        className={`p-3 border rounded-xl flex items-center justify-center gap-2 transition-colors ${
                          formData.defaultTransactionType === type
                            ? "bg-green-50 border-green-600 text-green-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-1">
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
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-colors ${
                        formData.defaultPaymentMethod === "card"
                          ? "bg-green-50 border-green-600 text-green-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultPaymentMethod: "cash",
                        }))
                      }
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl transition-colors ${
                        formData.defaultPaymentMethod === "cash"
                          ? "bg-green-50 border-green-600 text-green-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Cash</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
