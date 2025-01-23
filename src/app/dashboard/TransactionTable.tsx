'use client'
import React, { useState } from 'react';
import { 
  ArrowUpDown,
  Calendar,
  CreditCard,
  Wallet,
  MoreHorizontal,
  DollarSign,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';
import { Transaction, FilterState } from '@/types/transaction';
import { useCategories } from '@/contexts/CategoryContext';


interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  formatAmount: (amount: number) => string;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTransaction,
  filters,
  onFilterChange,
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { categories } = useCategories();
  

  const clearFilters = () => {
    onFilterChange({
      type: "all",
      category: "all",
      paymentMethod: "all",
      startDate: "",
      endDate: ""
    });
  };

  const hasActiveFilters = 
    filters.type !== "all" || 
    filters.category !== "all" || 
    filters.paymentMethod !== "all" || 
    filters.startDate || 
    filters.endDate;

  const MobileFilters = () => (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm md:hidden">
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg animate-slide-left">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">Filters</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Type</label>
            <select 
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value as FilterState['type'] })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Payment Method</label>
            <select 
              value={filters.paymentMethod}
              onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value as FilterState['paymentMethod'] })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 mb-2 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="all">All Categories</option>
              <optgroup label="Income">
                {categories.income.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </optgroup>
              <optgroup label="Expense">
                {categories.expense.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg relative"
          >
            <Filter className="w-5 h-5 text-slate-600" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
            )}
          </button>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left py-3 px-4">
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <Calendar className="w-4 h-4" />
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                  <div className="hidden md:flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                      placeholder="From"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                      placeholder="To"
                    />
                  </div>
                </div>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-sm font-medium text-slate-600">Description</span>
              </th>
              <th className="text-left py-3 px-4">
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Payment</span>
                  <select 
                    value={filters.paymentMethod}
                    onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value as FilterState['paymentMethod'] })}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="all">All</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <span className="md:hidden text-sm font-medium text-slate-600">Payment</span>
              </th>
              <th className="text-left py-3 px-4">
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600">Category</span>
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                    className="px-2 py-1 text-xs border border-slate-200 rounded-lg max-w-[120px]"
                  >
                    <option value="all">All</option>
                    <optgroup label="Income">
                      {categories.income.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Expense">
                      {categories.expense.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <span className="md:hidden text-sm font-medium text-slate-600">Category</span>
              </th>
              <th className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                  <div className="hidden md:block">
                    <select 
                      value={filters.type}
                      onChange={(e) => onFilterChange({ ...filters, type: e.target.value as FilterState['type'] })}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                    >
                      <option value="all">All</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
              </th>
              <th className="w-20 py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr 
                key={transaction._id}
                onClick={() => onSelectTransaction(transaction)}
                className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-4">
                  <span className="text-sm text-slate-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-slate-800">
                    {transaction.description}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {transaction.paymentMethod === 'card' ? (
                      <CreditCard className="w-3 h-3" />
                    ) : (
                      <Wallet className="w-3 h-3" />
                    )}
                    {transaction.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {transaction.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className={`w-4 h-4 ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button 
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add your action menu logic here
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && <MobileFilters />}
    </div>
  );
};