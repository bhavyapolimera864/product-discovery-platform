// Core Types for the Product Discovery Platform

export type ProductCategory =
  | "laptops"
  | "smartphones"
  | "headphones"
  | "appliances"
  | "cameras"
  | "other";

export type DataFreshness = "fresh" | "stale" | "unavailable";

export type ConstraintType = "hard" | "soft" | "flexible";

/**
 * Normalized product representation
 */
export interface Product {
  id: string; // Unique product ID in our system
  productId: string; // External product ID from provider
  name: string;
  brand?: string;
  category: ProductCategory;
  description?: string;
  price?: number;
  currency: string; // ISO 4217 code
  imageUrl?: string;
  productUrl?: string; // Link to product on provider
  specifications?: Record<string, any>; // Category-specific specs
  source: string; // Data provider name
  sourceId?: string; // ID from the provider
  seller?: string;
  availability: string; // "in_stock", "preorder", "unavailable", etc.
  inStock: boolean;
  rating?: number; // 0-5
  reviewCount?: number;
  status: "current" | "stale" | "unavailable" | "error";
  dataFreshness: DataFreshness;
  lastUpdated: Date;
  embedding?: number[]; // Vector embedding for semantic search
  metadata?: Record<string, any>;
}

/**
 * Structured user preference representation
 */
export interface UserPreference {
  id?: string;
  userId: string;
  rawQuery: string;
  category?: ProductCategory;
  intendedUse?: string;
  budget?: number;
  budgetCurrency?: string;
  constraints: Constraint[];
  preferences: PreferenceItem[];
  importance: Record<string, number>; // Weights for different factors
  tradeoffs: Tradeoff[];
  clarificationQuestions?: string[];
  validationErrors?: string[];
  extractedAt?: Date;
}

export interface Constraint {
  type: ConstraintType; // hard, soft, flexible
  attribute: string; // e.g., "ram", "battery_life", "price"
  operator?: "===" | ">=" | "<=" | ">" | "<" | "in" | "contains";
  value: any;
  importance?: number; // 0-1, higher = more important
  reason?: string;
}

export interface PreferenceItem {
  attribute: string;
  desiredValue?: any;
  priority: "critical" | "high" | "medium" | "low";
  flexibility?: number; // 0-1, how much trade-off is acceptable
}

export interface Tradeoff {
  from: string; // attribute
  to: string; // attribute
  reason?: string;
}

/**
 * Recommendation result
 */
export interface Recommendation {
  product: Product;
  rank: number;
  score: number; // 0-100 or 0-1
  scoreBreakdown: Record<string, number>; // Component scores
  explanation: string; // Evidence-based explanation
  constraintViolations?: string[]; // If any constraints are violated
  relevanceMatches?: string[]; // Matching aspects
  tradeoffs?: string[]; // Identified trade-offs
}

/**
 * Search request/response
 */
export interface SearchRequest {
  query: string;
  category?: ProductCategory;
  limit?: number;
  offset?: number;
  userId?: string;
}

export interface SearchResponse {
  query: string;
  preference: UserPreference;
  results: Recommendation[];
  totalCount: number;
  clarificationQuestions?: string[];
  errors?: string[];
}

/**
 * Comparison request/response
 */
export interface ComparisonRequest {
  productIds: string[];
  userId?: string;
}

export interface ComparisonResponse {
  products: Product[];
  comparison: Record<string, Record<string, any>>; // Attribute matrix
  tradeoffAnalysis: string;
  reasoning: Record<string, string>;
}

/**
 * Product provider interface
 */
export interface ProductProvider {
  name: string;
  category: ProductCategory;
  search(query: string, limit?: number): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
  getCategories(): Promise<ProductCategory[]>;
}

/**
 * Embedding service interface
 */
export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * Preference extractor interface
 */
export interface PreferenceExtractor {
  extract(query: string): Promise<UserPreference>;
  validate(preference: UserPreference): Promise<{
    valid: boolean;
    errors: string[];
  }>;
}

/**
 * Ranking engine interface
 */
export interface RankingEngine {
  rank(
    products: Product[],
    preferences: UserPreference
  ): Promise<Recommendation[]>;
}

/**
 * Explanation generator
 */
export interface ExplanationGenerator {
  generateProductExplanation(
    product: Product,
    preferences: UserPreference,
    score: number
  ): Promise<string>;

  generateTradeoffExplanation(
    products: Product[],
    preferences: UserPreference
  ): Promise<string>;
}

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * RAG context
 */
export interface RAGContext {
  query: string;
  retrievedProducts: Product[];
  userPreference: UserPreference;
  conversationHistory: ConversationMessage[];
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  timestamp: Date;
}

/**
 * Pagination
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
