import React, { useState } from "react";
import { Calendar } from "lucide-react";

const DatePicker = ({
  selectedDate,
  onChange,
}: {
  selectedDate: Date;
  onChange: (date: Date) => void;
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format date to YYYY-MM-DD with timezone handling
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse date from input value, adjusting for timezone
  const handleDateChange = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    newDate.setHours(12); // Set to noon to avoid timezone issues
    onChange(newDate);
  };

  // Close picker when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".date-picker-container")) {
      setShowDatePicker(false);
    }
  };

  // Add/remove click outside listener
  React.useEffect(() => {
    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  return (
    <div className="mb-4 date-picker-container">
      <div className="text-gray-500 text-sm mb-1">Date</div>
      <div className="relative">
        <div
          onClick={() => {
            setShowDatePicker(true);
          }}
          className="w-full flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {showDatePicker && (
          <div className="absolute z-20 mt-1 bg-white border rounded-lg shadow-lg p-2">
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={(e) => {
                handleDateChange(e.target.value);
                // Don't close the picker immediately to allow for multiple selections
              }}
              onBlur={() => setShowDatePicker(false)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
              // Open the native date picker immediately when the container is clicked
              autoFocus
              onClick={(e) => {
                e.stopPropagation();
                (e.target as HTMLInputElement).showPicker();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
