/* eslint-disable @typescript-eslint/no-unused-vars */
// contexts/UserPreferencesContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

interface UserPreferences {
  currency: string;
  cashBalance: number;
  defaultTransactionType: "income" | "expense";
  defaultPaymentMethod: "card" | "cash";
}

interface CurrencyFormat {
  symbol: string;
  position: "before" | "after";
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => string;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  currency: "USD",
  cashBalance: 0,
  defaultTransactionType: "expense",
  defaultPaymentMethod: "card",
};

export const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
];


const currencyFormats: Record<string, CurrencyFormat> = {
  USD: { symbol: "$", position: "before" },
  EUR: { symbol: "€", position: "before" },
  GBP: { symbol: "£", position: "before" },
  INR: { symbol: "₹", position: "before" },
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const formatAmount = useCallback(
    (amount: number): string => {
      const format =
        currencyFormats[preferences.currency] || currencyFormats.USD;
      const formattedNumber = amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return format.position === "before"
        ? `${format.symbol}${formattedNumber}`
        : `${formattedNumber}${format.symbol}`;
    },
    [preferences.currency]
  );

  const getCurrencySymbol = useCallback((): string => {
    return currencyFormats[preferences.currency]?.symbol || "$";
  }, [preferences.currency]);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/profile`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences((prev) => ({
        ...prev,
        currency: data.currency || prev.currency,
        cashBalance: data.cashBalance ?? prev.cashBalance,
        defaultTransactionType:
          data.defaultTransactionType || prev.defaultTransactionType,
        defaultPaymentMethod:
          data.defaultPaymentMethod || prev.defaultPaymentMethod,
      }));
      setLastUpdate(Date.now());
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch preferences"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...preferences,
            ...newPreferences,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      const data = await response.json();
      setPreferences((prev) => ({
        ...prev,
        ...newPreferences,
      }));
      setLastUpdate(Date.now());

      // Force refresh all components using preferences
      window.dispatchEvent(new Event("preferencesUpdated"));

      return data;
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      throw err;
    }
  };

  const refreshPreferences = async () => {
    if (isAuthenticated) {
      await fetchPreferences();
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated, fetchPreferences]);

  // Listen for preference updates from other components
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      fetchPreferences();
    };

    window.addEventListener("preferencesUpdated", handlePreferencesUpdate);

    return () => {
      window.removeEventListener("preferencesUpdated", handlePreferencesUpdate);
    };
  }, [fetchPreferences]);

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        formatAmount,
        getCurrencySymbol,
        updatePreferences,
        refreshPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
