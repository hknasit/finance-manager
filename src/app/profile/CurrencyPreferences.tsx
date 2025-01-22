'use client';
import React, { useState } from "react";
import { useUserPreferences, AVAILABLE_CURRENCIES } from "@/contexts/UserPreferencesContext";
import { Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";

export default function CurrencyPreferences() {
  const { preferences, updatePreferences, loading, error } = useUserPreferences();
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = async (currencyCode: string) => {
    try {
      setUpdating(true);
      await updatePreferences({ currency: currencyCode });
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update currency:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Find current currency details
  const currentCurrency = AVAILABLE_CURRENCIES.find(
    (c) => c.code === preferences.currency
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Select Currency
      </label>
      
      {/* Custom Select Button */}
      <button
        type="button"
        onClick={() => !updating && !loading && setIsOpen(!isOpen)}
        disabled={updating || loading}
        className="relative w-full bg-white px-4 py-3 text-left border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {currentCurrency?.name} ({currentCurrency?.code})
            </span>
          </span>
          {updating || loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
          <div className="py-1">
            {AVAILABLE_CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${
                  preferences.currency === currency.code ? 'text-green-600 bg-green-50' : 'text-gray-900'
                }`}
                onClick={() => handleCurrencyChange(currency.code)}
              >
                <span className="flex items-center gap-2">
                  <span>{currency.name}</span>
                  <span className="text-gray-400">({currency.code})</span>
                </span>
                {preferences.currency === currency.code && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}