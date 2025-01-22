// components/Dashboard/DashboardHeader.tsx
import React from "react";
import { Filter, Plus, Wallet, CreditCard } from "lucide-react";
import { FilterState } from "@/types/transaction";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

interface DashboardHeaderProps {
  onShowFilters: () => void;
  onAddTransaction: () => void;
  filters: FilterState;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onShowFilters,
  onAddTransaction,
  filters,
}) => {
  const { preferences, formatAmount } = useUserPreferences();
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Left Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <h1 className="text-xl font-semibold text-slate-800">
              Dashboard Overview
            </h1>

            {/* Balances - Desktop */}
            <div className="hidden md:flex items-center divide-x divide-slate-200">
              <div className="pr-6">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Cash Balance:</span>

                  <span className="text-sm font-medium text-slate-800">
                    {formatAmount(preferences.cashBalance)}
                  </span>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Bank Balance:</span>
                  <span className="text-sm font-medium text-slate-800">
                    {" "}
                    {formatAmount(preferences.bankBalance)}{" "}
                  </span>
                </div>
              </div>
            </div>

            {/* Balances - Mobile */}
            <div className="flex md:hidden items-center gap-4">
              <div className="flex-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-500">Cash</span>
                    <p className="text-sm font-medium text-slate-800">
                      {formatAmount(preferences.cashBalance)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-500">Bank</span>
                    <p className="text-sm font-medium text-slate-800">
                      {formatAmount(preferences.bankBalance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              onClick={onShowFilters}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
              {(filters.type !== "all" ||
                filters.category !== "all" ||
                filters.paymentMethod !== "all" ||
                filters.startDate ||
                filters.endDate) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
              )}
            </button>
            <button
              onClick={onAddTransaction}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
