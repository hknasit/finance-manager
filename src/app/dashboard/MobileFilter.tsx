'use client';
import { useState } from "react";
import { X, Filter } from "lucide-react";

export default function MobileFilter({ children }: { children: React.ReactNode }) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <>
      {/* Floating Button for Mobile */}
      <button
        onClick={() => setShowFilter(true)}
        className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg "
      >
        <Filter className="w-5 h-5" />
      </button>

      {/* Mobile Filter Drawer */}
      {showFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 ">
          <div className="w-4/5 h-full bg-white p-6 shadow-xl relative">
            <button onClick={() => setShowFilter(false)} className="absolute top-2 right-2">
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            {children}
          </div>
        </div>
      )}


    </>
  );
}
