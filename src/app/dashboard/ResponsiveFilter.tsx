/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { useState, useEffect } from "react";
import { X, Filter, ChevronDown, ChevronUp, Check } from "lucide-react";

export default function ResponsiveFilter({ 
  children, 
  onApply,
  onClear,
  isProcessing,
  isLoading
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Check if we're on desktop on component mount and window resize
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };
    
    // Check on mount
    checkIfDesktop();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfDesktop);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  // Prevent background scrolling when filter is open on mobile
  useEffect(() => {
    if (!isDesktop && showFilter) {
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
      
      return () => {
        // Restore scrolling when component unmounts or filter closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showFilter, isDesktop]);

  // Handle closing filter sheet
  const closeFilter = () => {
    setShowFilter(false);
  };
  
  return (
    <>
      {/* Desktop Filter Panel */}
      {isDesktop && (
        <div className="mb-6 w-full transition-all duration-300 ease-in-out">
          <div 
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
          >
            {/* Header with expand/collapse toggle */}
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-slate-100"
              onClick={() => setExpanded(!expanded)}
            >
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600" />
                Filters
              </h3>
              <div className="flex items-center gap-3">
                {expanded && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClear && onClear();
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-500  bg-red-50 border border-slate-300 rounded-lg hover:text-red-600"
                      disabled={isProcessing}
                    >
                      Clear
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply && onApply();
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      disabled={isProcessing || isLoading}
                    >
                      <Check className="w-4 h-4" />
                      Apply
                    </button>
                  </div>
                )}
                {expanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
            
            {/* Collapsible content */}
            <div className={`overflow-hidden transition-all duration-300 ${
              expanded ? "max-h-96" : "max-h-0"
            }`}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile floating button */}
      {!isDesktop && (
        <button
          onClick={() => setShowFilter(true)}
          className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg z-40"
          aria-label="Open filters"
        >
          <Filter className="w-5 h-5" />
        </button>
      )}

      {/* Mobile bottom sheet */}
      {!isDesktop && showFilter && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50" 
          onClick={closeFilter}
        >
          <div 
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button 
                onClick={closeFilter}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content - Scrollable area */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 -webkit-overflow-scrolling-touch">
              <div className="space-y-4">
                {children}
              </div>
            </div>
            
            {/* Footer with action buttons */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClear && onClear();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-red-500  bg-red-50 border border-slate-300 rounded-lg hover:text-red-600 touch-manipulation"
                  disabled={isProcessing}
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    onApply && onApply();
                    closeFilter();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 touch-manipulation"
                  disabled={isProcessing || isLoading}
                >
                  <Check className="w-4 h-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}