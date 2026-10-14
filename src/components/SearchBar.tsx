"use client";

import { useState } from "react";
import { FiSearch, FiLoader } from "react-icons/fi";

interface SearchBarProps {
  onSearch: (query: string, category?: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, category || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {isLoading ? (
            <FiLoader className="w-5 h-5 text-slate-400 animate-spin" />
          ) : (
            <FiSearch className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          placeholder="E.g., 'I need a laptop for programming with good battery life under $1000'"
          className="w-full pl-12 pr-4 py-4 text-lg rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <label className="text-sm font-medium text-slate-600 self-center">
          Category:
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "", label: "Any" },
            { value: "laptops", label: "Laptops" },
            { value: "smartphones", label: "Phones" },
            { value: "headphones", label: "Headphones" },
            { value: "appliances", label: "Appliances" },
            { value: "cameras", label: "Cameras" },
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                category === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!query.trim() || isLoading}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <FiLoader className="w-5 h-5 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <FiSearch className="w-5 h-5" />
            Find Products
          </>
        )}
      </button>
    </form>
  );
}
