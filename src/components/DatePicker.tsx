"use client";

import React, { useRef } from "react";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Format date for display in the button
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format date to YYYY-MM-DD for input value
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle date change from native picker
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
      const [year, month, day] = dateString.split("-").map(Number);
      const newDate = new Date(year, month - 1, day);
      newDate.setHours(12); // Set to noon to avoid timezone issues
      onChange(newDate);
    }
  };

  // Open the date picker directly when the button is clicked
  const handleButtonClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Date
      </label>
      <div className="relative">
        {/* Hidden date input that holds the actual value */}
        <input
          ref={inputRef}
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          className="sr-only"
          disabled={disabled}
          aria-label="Select date"
        />
        
        {/* Custom styled button that triggers the native date picker */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full flex items-center justify-between py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-slate-500" />
            <span className="text-sm">{formatDisplayDate(selectedDate)}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DatePicker;