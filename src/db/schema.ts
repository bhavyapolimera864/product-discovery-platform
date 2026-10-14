import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const categoryEnum = pgEnum("category", [
  "laptops",
  "smartphones",
  "headphones",
  "appliances",
  "cameras",
  "other",
]);

export const statusEnum = pgEnum("status", [
  "current",
  "stale",
  "unavailable",
  "error",
]);

export const constraintTypeEnum = pgEnum("constraint_type", [
  "hard",
  "soft",
  "flexible",
]);

// Products Table
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    productId: varchar("product_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 500 }).notNull(),
    brand: varchar("brand", { length: 255 }),
    category: categoryEnum("category").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("USD"),
    imageUrl: varchar("image_url", { length: 500 }),
    productUrl: varchar("product_url", { length: 500 }),
    specifications: json("specifications"),
    source: varchar("source", { length: 100 }),
    sourceId: varchar("source_id", { length: 255 }),
    seller: varchar("seller", { length: 255 }),
    availability: varchar("availability", { length: 50 }).default("unknown"),
    inStock: boolean("in_stock").default(true),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").default(0),
    status: statusEnum("status").default("current"),
    dataFreshness: varchar("data_freshness", { length: 50 }).default("fresh"),
    lastUpdated: timestamp("last_updated").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    metadata: json("metadata"),
    embedding: json("embedding"), // Stored as JSON array for vector embeddings
  },
  (table) => ({
    categoryIdx: index("products_category_idx").on(table.category),
    brandIdx: index("products_brand_idx").on(table.brand),
    sourceIdx: index("products_source_idx").on(table.source),
    statusIdx: index("products_status_idx").on(table.status),
    productIdIdx: uniqueIndex("products_product_id_idx").on(table.productId),
  })
);

// User Preferences Table
export const userPreferences = pgTable(
  "user_preferences",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    rawQuery: text("raw_query").notNull(),
    category: categoryEnum("category"),
    intendedUse: text("intended_use"),
    budget: decimal("budget", { precision: 12, scale: 2 }),
    budgetCurrency: varchar("budget_currency", { length: 3 }).default("USD"),
    constraints: json("constraints"),
    preferences: json("preferences"),
    importance: json("importance"),
    tradeoffs: json("tradeoffs"),
    clarificationQuestions: json("clarification_questions"),
    validationErrors: json("validation_errors"),
    extractedAt: timestamp("extracted_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("user_preferences_user_id_idx").on(table.userId),
    categoryIdx: index("user_preferences_category_idx").on(table.category),
  })
);

// Constraints Table
export const constraints = pgTable(
  "constraints",
  {
    id: serial("id").primaryKey(),
    preferenceId: integer("preference_id").notNull(),
    type: constraintTypeEnum("type").notNull(),
    attribute: varchar("attribute", { length: 100 }).notNull(),
    operator: varchar("operator", { length: 20 }),
    value: varchar("value", { length: 255 }),
    importance: decimal("importance", { precision: 3, scale: 2 }).default("1.0"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    preferenceIdx: index("constraints_preference_id_idx").on(table.preferenceId),
    typeIdx: index("constraints_type_idx").on(table.type),
  })
);

// Search History Table
export const searchHistory = pgTable(
  "search_history",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    query: text("query").notNull(),
    category: categoryEnum("category"),
    resultsCount: integer("results_count"),
    topProductId: integer("top_product_id"),
    interactionTime: integer("interaction_time"),
    feedbackRating: integer("feedback_rating"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("search_history_user_id_idx").on(table.userId),
    categoryIdx: index("search_history_category_idx").on(table.category),
  })
);

// Recommendation Results Table
export const recommendations = pgTable(
  "recommendations",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    preferenceId: integer("preference_id").notNull(),
    productId: integer("product_id").notNull(),
    rank: integer("rank"),
    score: decimal("score", { precision: 5, scale: 4 }),
    scoreBreakdown: json("score_breakdown"),
    explanation: text("explanation"),
    constraintViolations: json("constraint_violations"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("recommendations_user_id_idx").on(table.userId),
    preferenceIdx: index("recommendations_preference_id_idx").on(table.preferenceId),
    productIdx: index("recommendations_product_id_idx").on(table.productId),
  })
);

// Product Comparisons Table
export const comparisons = pgTable(
  "comparisons",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    productIds: json("product_ids"),
    comparison: json("comparison"),
    explanations: json("explanations"),
    tradeoffAnalysis: text("tradeoff_analysis"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("comparisons_user_id_idx").on(table.userId),
  })
);

// Chat/Conversation History
export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    messages: json("messages"),
    preferenceId: integer("preference_id"),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdx: index("conversations_user_id_idx").on(table.userId),
    preferenceIdx: index("conversations_preference_id_idx").on(table.preferenceId),
  })
);
