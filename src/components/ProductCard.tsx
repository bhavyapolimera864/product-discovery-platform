"use client";

import { Recommendation } from "@/types";
import { FiCheck, FiImage, FiExternalLink } from "react-icons/fi";

interface ProductCardProps {
  recommendation: Recommendation;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function ProductCard({
  recommendation,
  isSelected,
  onSelect,
}: ProductCardProps) {
  const { product, score, scoreBreakdown, explanation, relevanceMatches, tradeoffs } =
    recommendation;

  return (
    <div
      className={`rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 p-6">
        {/* Image */}
        <div className="flex-shrink-0 w-full sm:w-40 h-40 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="text-slate-400">
              <FiImage className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-sm text-slate-600">{product.brand}</p>
              )}
            </div>
            <button
              onClick={onSelect}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-300 hover:border-blue-500"
              }`}
            >
              {isSelected && <FiCheck className="w-4 h-4" />}
            </button>
          </div>

          {/* Price and Availability */}
          <div className="flex items-center gap-4 mb-4">
            {product.price && (
              <div className="text-2xl font-bold text-slate-900">
                ${product.price.toLocaleString()}
              </div>
            )}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.inStock
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </div>
            {product.rating && (
              <div className="text-sm font-medium text-slate-900">
                ⭐ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Key Specs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-semibold text-slate-600 mb-2">KEY SPECS</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(product.specifications)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div key={key}>
                      <p className="text-slate-500 capitalize">{key}</p>
                      <p className="font-medium text-slate-900">{String(value)}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 font-medium">Why this match</p>
            <p className="text-sm text-blue-800 mt-1">{explanation}</p>
          </div>

          {/* Score Breakdown */}
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            {Object.entries(scoreBreakdown).map(([key, value]) => {
              const keyName = key
                .replace(/([A-Z])/g, " $1")
                .trim()
                .split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
              return (
                <div key={key} className="text-center p-2 bg-slate-100 rounded">
                  <p className="text-slate-600 font-medium">{keyName}</p>
                  <p className="text-slate-900 font-bold">{Math.round(value * 100)}%</p>
                </div>
              );
            })}
          </div>

          {/* Relevance Matches */}
          {relevanceMatches && relevanceMatches.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">MATCHES YOUR NEEDS</p>
              <div className="flex flex-wrap gap-2">
                {relevanceMatches.slice(0, 3).map((match, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium"
                  >
                    {match}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tradeoffs */}
          {tradeoffs && tradeoffs.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">TRADE-OFFS</p>
              <ul className="text-xs text-slate-600 space-y-1">
                {tradeoffs.slice(0, 2).map((tradeoff, idx) => (
                  <li key={idx}>• {tradeoff}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Source: {product.source} • Updated {new Date(product.lastUpdated).toLocaleDateString()}
            </div>
            {product.productUrl && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                View Listing
                <FiExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Ranking Badge */}
        <div className="flex-shrink-0 text-right">
          <div className="text-3xl font-bold text-blue-600">{recommendation.rank}</div>
          <div className="text-xs text-slate-600">Ranked</div>
          <div className="mt-4 text-center">
            <div className="text-4xl font-bold text-slate-900">
              {score}
            </div>
            <div className="text-xs text-slate-600">Match Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
