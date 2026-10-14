"use client";

import { UserPreference } from "@/types";
import { FiEdit2, FiFilter } from "react-icons/fi";
import { useState } from "react";

interface PreferencePanelProps {
  preference: UserPreference;
  onRefinement?: (query: string, category?: string) => void;
}

export default function PreferencePanel({
  preference,
  onRefinement,
}: PreferencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FiFilter className="w-5 h-5" />
          Your Preferences
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <FiEdit2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Extracted Preference Summary */}
      <div className="space-y-3 pb-4 border-b border-slate-200">
        {preference.category && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Category</p>
            <p className="text-sm font-medium text-slate-900 capitalize">
              {preference.category}
            </p>
          </div>
        )}

        {preference.budget && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Budget</p>
            <p className="text-sm font-medium text-slate-900">
              Up to {preference.budgetCurrency || "USD"} {preference.budget}
            </p>
          </div>
        )}

        {preference.intendedUse && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Intended Use</p>
            <p className="text-sm font-medium text-slate-900">
              {preference.intendedUse}
            </p>
          </div>
        )}
      </div>

      {/* Constraints */}
      {preference.constraints && preference.constraints.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Must-Have Constraints
          </p>
          <div className="space-y-2">
            {preference.constraints
              .filter((c) => c.type === "hard")
              .slice(0, 3)
              .map((constraint, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800"
                >
                  <p className="font-medium capitalize">{constraint.attribute}</p>
                  <p className="text-red-700">{constraint.reason || "Required"}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Preferences */}
      {preference.preferences && preference.preferences.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Preferred Attributes
          </p>
          <div className="space-y-2">
            {preference.preferences.slice(0, 3).map((pref, idx) => (
              <div
                key={idx}
                className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800"
              >
                <p className="font-medium capitalize">{pref.attribute}</p>
                <p className="text-blue-700">Priority: {pref.priority}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade-offs Identified */}
      {preference.tradeoffs && preference.tradeoffs.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Willing to Compromise
          </p>
          <div className="space-y-1">
            {preference.tradeoffs.slice(0, 2).map((tradeoff, idx) => (
              <p key={idx} className="text-xs text-slate-700">
                • {tradeoff.from} for {tradeoff.to}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Clarification Questions */}
      {preference.clarificationQuestions &&
        preference.clarificationQuestions.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
            <p className="text-xs font-semibold text-amber-900 mb-2">Need to clarify:</p>
            <ul className="text-xs text-amber-800 space-y-1">
              {preference.clarificationQuestions.slice(0, 2).map((q, idx) => (
                <li key={idx}>• {q}</li>
              ))}
            </ul>
          </div>
        )}

      {/* Edit/Refine Button */}
      {isExpanded && (
        <button
          onClick={() => {
            if (onRefinement) {
              onRefinement(preference.rawQuery + " (refined)");
            }
          }}
          className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-medium transition-colors"
        >
          Refine Search
        </button>
      )}
    </div>
  );
}
