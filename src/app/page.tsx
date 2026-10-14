"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { FiArrowRight, FiStar, FiTrendingUp } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string, category?: string) => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        ...(category && { category }),
      });
      router.push(`/search?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    {
      query: "Laptop for programming and machine learning under $1500",
      category: "laptops",
    },
    {
      query: "Affordable smartphone with good battery life",
      category: "smartphones",
    },
    {
      query: "Noise-cancelling headphones for music and work",
      category: "headphones",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Smart Discovery
            </span>
          </div>
          <a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
          >
            System Status
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-3xl">
          {/* Headline */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-950 mb-4 leading-tight">
              Find Your Perfect Product
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-6">
              Describe what you need in natural language. Our AI understands your preferences,
              constraints, and trade-offs to recommend the best options.
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {/* Features */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <FiStar className="w-6 h-6" />,
                title: "Smart Ranking",
                description: "Multi-factor ranking based on your unique preferences",
              },
              {
                icon: <FiTrendingUp className="w-6 h-6" />,
                title: "Transparent Scoring",
                description: "Understand exactly why each product is ranked",
              },
              {
                icon: <FiArrowRight className="w-6 h-6" />,
                title: "Easy Comparison",
                description: "Compare alternatives and identify trade-offs",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="text-blue-600 mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Example Queries */}
          <div className="mt-12 sm:mt-16">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Try an example
            </h2>
            <div className="space-y-3">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(example.query, example.category)}
                  disabled={isLoading}
                  className="w-full text-left p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <p className="text-sm text-slate-900 font-medium">
                    {example.query}
                  </p>
                  {example.category && (
                    <p className="text-xs text-slate-500 mt-1">
                      Category: {example.category}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600">
            Using real-time product data • Personalized AI recommendations • Your preferences, your choices
          </p>
        </div>
      </footer>
    </div>
  );
}
