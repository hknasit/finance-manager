// components/CategoryItem.tsx
import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface CategoryItemProps {
  category: {
    _id: string;
    name: string;
    type: 'income' | 'expense';
  };
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isSelected?: boolean;
}

export function CategoryItem({ 
  category, 
  onSelect, 
  onEdit, 
  onDelete, 
  isSelected 
}: CategoryItemProps) {
  const [showActions, setShowActions] = useState(false);
  return (
    <div className="relative">
      <button
        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group ${
          isSelected ? 'bg-slate-50' : ''
        }`}
        onClick={onSelect}
      >
        <span className="text-slate-700">{category.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="p-1 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal size={18} className="text-slate-500" />
        </button>
      </button>

      {/* Dropdown Actions */}
      {showActions && (
        <div 
          className="absolute right-2 top-10 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30"
          onMouseLeave={() => setShowActions(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
              onEdit();
            }}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(false);
              onDelete();
            }}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 text-red-600"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}