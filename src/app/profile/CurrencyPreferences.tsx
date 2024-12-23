// components/CurrencyPreferences.tsx
"use client";
import React, { useState } from "react";
import {
  useUserPreferences,
  AVAILABLE_CURRENCIES,
} from "@/contexts/UserPreferencesContext";

export default function CurrencyPreferences() {
  const { preferences, updatePreferences, loading, error } =
    useUserPreferences();
  const [updating, setUpdating] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    try {
      setUpdating(true);
      await updatePreferences({ currency });
    } catch (err) {
      console.error("Failed to update currency:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Currency</label>
        <select
          value={preferences.currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          disabled={updating || loading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
        >
          {AVAILABLE_CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      {(error || updating) && (
        <div className={`text-sm ${error ? "text-red-600" : "text-gray-500"}`}>
          {error || (updating ? "Updating preferences..." : "")}
        </div>
      )}
    </div>
  );
}
