"use client";

import { FiBarChart2, FiX } from "react-icons/fi";

interface ComparisonBarProps {
  selectedCount: number;
  onCompare: () => void;
  onClear?: () => void;
}

export default function ComparisonBar({
  selectedCount,
  onCompare,
  onClear,
}: ComparisonBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiBarChart2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-900">
            {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCompare}
            disabled={selectedCount < 2}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Compare ({selectedCount})
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
            >
              <FiX className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
