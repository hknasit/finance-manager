// components/Dashboard/TransactionTable.tsx
import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Calendar, 
  CreditCard, 
  Wallet, 
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
import { Transaction, FilterState } from '@/types/transaction';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm">
      {/* Table Filters */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-600 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            <select 
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value as FilterState['type'] })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-600 transition-all"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select 
              value={filters.paymentMethod}
              onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value as FilterState['paymentMethod'] })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-600 transition-all"
            >
              <option value="all">All Methods</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {!filteredTransactions.length ? (
          <div className="py-12 text-center text-slate-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                  <button className="flex items-center gap-1 hover:text-slate-900">
                    <Calendar className="w-4 h-4" />
                    Date
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Category</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                  <button className="flex items-center gap-1 hover:text-slate-900 ml-auto">
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="w-20 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction._id}
                  className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectTransaction(transaction)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-slate-800">{transaction.description}</span>
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
        )}
      </div>
    </div>
  );
};