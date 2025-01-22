// components/Dashboard/MonthlyOverview.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, BadgeDollarSign } from 'lucide-react';

interface MonthlyOverviewProps {
  selectedDate: Date;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  totals: {
    income: number;
    expense: number;
  };
  formatAmount: (amount: number) => string;
}

export const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({
  selectedDate,
  onNavigateMonth,
  totals,
  formatAmount
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm mb-2">
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto,auto] divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Month Selector */}
        <div className="p-4 flex items-center justify-between md:justify-start gap-3">
          <button 
            onClick={() => onNavigateMonth("prev")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="text-lg font-medium text-slate-800">
            {selectedDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button 
            onClick={() => onNavigateMonth("next")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 bg-red-50/50">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {formatAmount(totals.expense)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-green-50/50">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {formatAmount(totals.income)}
            </span>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="w-4 h-4 text-blue-600" />
            <span className={`text-sm font-medium ${
              totals.income - totals.expense >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {formatAmount(totals.income - totals.expense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};