"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { SearchResponse, Recommendation } from "@/types";
import ProductCard from "@/components/ProductCard";
import PreferencePanel from "@/components/PreferencePanel";
import ComparisonBar from "@/components/ComparisonBar";
import SearchBar from "@/components/SearchBar";
import { FiLoader, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    if (!query) {
      setError("No search query provided");
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            category: category || undefined,
            limit: 20,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Search failed");
        }

        const data = await response.json();
        setSearchData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, category]);

  const handleSearch = (newQuery: string, newCategory?: string) => {
    const params = new URLSearchParams({ q: newQuery });
    if (newCategory) params.append("category", newCategory);
    window.history.pushState(null, "", `/search?${params.toString()}`);
    window.location.reload();
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <FiLoader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-slate-600">Searching for products...</p>
            <p className="text-sm text-slate-500 mt-2">Analyzing your preferences and ranking options</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !searchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center max-w-md">
            <FiAlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg text-slate-900 font-semibold mb-2">
              {error || "No results found"}
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Try refining your search or adjusting your preferences
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              Back
            </Link>
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">
                  {selectedProducts.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs px-2 py-1 text-slate-600 hover:text-slate-900"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* New Search Bar */}
          <div className="mb-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Preferences and Filters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {searchData.preference && (
              <PreferencePanel
                preference={searchData.preference}
                onRefinement={handleSearch}
              />
            )}
          </div>

          {/* Main Content - Results */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Results Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Search Results
              </h1>
              <p className="text-slate-600">
                Found{" "}
                <span className="font-semibold text-slate-900">
                  {searchData.results.length}
                </span>{" "}
                products matching your preferences
              </p>

              {searchData.clarificationQuestions &&
                searchData.clarificationQuestions.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      We need more info:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {searchData.clarificationQuestions.map((q, idx) => (
                        <li key={idx}>• {q}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {/* Products Grid */}
            {searchData.results.length > 0 ? (
              <div className="space-y-4">
                {searchData.results.map((rec) => (
                  <ProductCard
                    key={rec.product.id}
                    recommendation={rec}
                    isSelected={selectedProducts.includes(rec.product.id)}
                    onSelect={() => toggleProductSelection(rec.product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <FiAlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg text-slate-600">No products found</p>
                <p className="text-sm text-slate-500 mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Bar */}
      {selectedProducts.length > 0 && (
        <ComparisonBar
          selectedCount={selectedProducts.length}
          onCompare={() => console.log("Compare", selectedProducts)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><FiLoader className="w-12 h-12 animate-spin text-blue-600" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
