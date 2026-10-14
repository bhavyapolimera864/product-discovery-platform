import {
  UserPreference,
  Constraint,
  ProductCategory,
  PreferenceItem,
  Tradeoff,
} from "@/types";
import { z } from "zod";

/**
 * Preference Extraction Service
 * Converts natural language queries into structured preference models.
 * Uses pattern matching and heuristics since we're in a single-process environment.
 */

// Validation schemas
const ConstraintSchema = z.object({
  type: z.enum(["hard", "soft", "flexible"]),
  attribute: z.string(),
  operator: z.enum(["===", ">=", "<=", ">", "<", "in", "contains"]).optional(),
  value: z.any(),
  importance: z.number().min(0).max(1).optional(),
  reason: z.string().optional(),
});

const PreferenceItemSchema = z.object({
  attribute: z.string(),
  desiredValue: z.any().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  flexibility: z.number().min(0).max(1).optional(),
});

const UserPreferenceSchema = z.object({
  userId: z.string(),
  rawQuery: z.string(),
  category: z
    .enum(["laptops", "smartphones", "headphones", "appliances", "cameras", "other"])
    .optional(),
  intendedUse: z.string().optional(),
  budget: z.number().optional(),
  budgetCurrency: z.string().optional(),
  constraints: z.array(ConstraintSchema),
  preferences: z.array(PreferenceItemSchema),
  importance: z.record(z.string(), z.number()),
  tradeoffs: z.array(z.object({ from: z.string(), to: z.string() })),
  clarificationQuestions: z.array(z.string()).optional(),
  validationErrors: z.array(z.string()).optional(),
});

class PreferenceExtractor {
  /**
   * Extract structured preferences from natural language query
   */
  async extract(query: string): Promise<UserPreference> {
    const errors: string[] = [];

    // Detect category
    const category = this.detectCategory(query);

    // Extract budget
    const budgetInfo = this.extractBudget(query);

    // Extract constraints and preferences
    const { constraints, preferences } = this.extractConstraintsAndPreferences(
      query,
      category
    );

    // Calculate importance weights
    const importance = this.calculateImportance(query, constraints, preferences);

    // Detect tradeoffs
    const tradeoffs = this.detectTradeoffs(query);

    // Detect intended use
    const intendedUse = this.extractIntendedUse(query);

    // Generate clarification questions if needed
    const clarificationQuestions = this.generateClarificationQuestions(
      query,
      constraints,
      budgetInfo
    );

    const preference: UserPreference = {
      userId: "default",
      rawQuery: query,
      category: category as ProductCategory | undefined,
      intendedUse,
      budget: budgetInfo.amount,
      budgetCurrency: budgetInfo.currency,
      constraints,
      preferences,
      importance,
      tradeoffs,
      clarificationQuestions: clarificationQuestions.length > 0 ? clarificationQuestions : undefined,
      validationErrors: errors.length > 0 ? errors : undefined,
      extractedAt: new Date(),
    };

    return preference;
  }

  /**
   * Validate extracted preferences
   */
  async validate(
    preference: UserPreference
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      UserPreferenceSchema.parse(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(
          ...error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`)
        );
      }
    }

    // Additional validation
    if (preference.budget !== undefined && preference.budget < 0) {
      errors.push("Budget cannot be negative");
    }

    if (preference.constraints.length === 0 && preference.preferences.length === 0) {
      errors.push("No constraints or preferences extracted from query");
    }

    const totalImportance = Object.values(preference.importance).reduce(
      (a, b) => a + b,
      0
    );
    if (totalImportance === 0) {
      errors.push("All importance weights are zero");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Private helper methods

  private detectCategory(query: string): ProductCategory | undefined {
    const queryLower = query.toLowerCase();

    const categoryKeywords: Record<ProductCategory, string[]> = {
      laptops: ["laptop", "macbook", "notebook", "computer", "coding", "programming", "work"],
      smartphones: ["phone", "smartphone", "mobile", "iphone", "android", "samsung"],
      headphones: ["headphone", "earphone", "earbud", "wireless", "audio", "music"],
      appliances: ["vacuum", "appliance", "washer", "dryer", "microwave"],
      cameras: ["camera", "dslr", "photography", "photo", "video recording"],
      other: [],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((kw) => queryLower.includes(kw))) {
        return category as ProductCategory;
      }
    }

    return undefined;
  }

  private extractBudget(query: string): { amount?: number; currency: string } {
    const budgetPatterns = [
      /(?:under|below|less than|max|maximum|upto|up to)\s*(?:$|₹|USD|$)?\s*(\d+(?:,\d+)?)/gi,
      /(?:$|₹|USD)\s*(\d+(?:,\d+)?)/gi,
      /(\d+(?:,\d+)?)\s*(?:dollars|USD|rupees|₹|bucks)/gi,
    ];

    for (const pattern of budgetPatterns) {
      const match = query.match(pattern);
      if (match) {
        const numberStr = match[0].match(/\d+(?:,\d+)?/)?.[0];
        if (numberStr) {
          const amount = parseFloat(numberStr.replace(/,/g, ""));
          const currency = query.includes("₹") ? "INR" : "USD";
          return { amount, currency };
        }
      }
    }

    return { currency: "USD" };
  }

  private extractConstraintsAndPreferences(
    query: string,
    category?: ProductCategory
  ): { constraints: Constraint[]; preferences: PreferenceItem[] } {
    const constraints: Constraint[] = [];
    const preferences: PreferenceItem[] = [];
    const queryLower = query.toLowerCase();

    // RAM constraints/preferences
    if (queryLower.includes("16gb") || queryLower.includes("16 gb")) {
      preferences.push({
        attribute: "ram",
        desiredValue: 16,
        priority: "high",
        flexibility: 0.3,
      });
    }
    if (queryLower.includes("8gb") || queryLower.includes("8 gb")) {
      if (queryLower.includes("minimum") || queryLower.includes("atleast")) {
        constraints.push({
          type: "hard",
          attribute: "ram",
          operator: ">=",
          value: 8,
          importance: 0.9,
        });
      } else {
        preferences.push({
          attribute: "ram",
          desiredValue: 8,
          priority: "medium",
        });
      }
    }

    // Storage constraints/preferences
    if (queryLower.includes("512gb") || queryLower.includes("512 gb")) {
      preferences.push({
        attribute: "storage",
        desiredValue: 512,
        priority: "medium",
        flexibility: 0.5,
      });
    }
    if (queryLower.includes("256gb") || queryLower.includes("256 gb")) {
      preferences.push({
        attribute: "storage",
        desiredValue: 256,
        priority: "low",
        flexibility: 0.7,
      });
    }

    // Battery life
    if (queryLower.includes("battery")) {
      if (
        queryLower.includes("very important") ||
        queryLower.includes("critical")
      ) {
        constraints.push({
          type: "soft",
          attribute: "batteryLife",
          operator: ">=",
          value: "10h",
          importance: 0.95,
          reason: "Battery life is critical for this user",
        });
      } else if (queryLower.includes("long") || queryLower.includes("all day")) {
        preferences.push({
          attribute: "batteryLife",
          desiredValue: "12h+",
          priority: "high",
          flexibility: 0.4,
        });
      }
    }

    // Display
    if (queryLower.includes("4k") || queryLower.includes("high res")) {
      preferences.push({
        attribute: "display",
        desiredValue: "4K or high resolution",
        priority: "medium",
      });
    }

    // Processor/Performance
    if (queryLower.includes("fast") || queryLower.includes("performance")) {
      preferences.push({
        attribute: "processor",
        desiredValue: "High-performance",
        priority: "high",
        flexibility: 0.3,
      });
    }

    // Weight/Portability
    if (queryLower.includes("light") || queryLower.includes("portable")) {
      preferences.push({
        attribute: "weight",
        desiredValue: "Lightweight",
        priority: "high",
        flexibility: 0.4,
      });
    }

    // Add a default constraint if none found
    if (constraints.length === 0) {
      if (category === "laptops") {
        constraints.push({
          type: "hard",
          attribute: "category",
          operator: "===",
          value: "laptops",
        });
      }
    }

    return { constraints, preferences };
  }

  private calculateImportance(
    query: string,
    constraints: Constraint[],
    preferences: PreferenceItem[]
  ): Record<string, number> {
    const importance: Record<string, number> = {};
    const queryLower = query.toLowerCase();

    // Default weights
    importance["price"] = 0.4;
    importance["relevance"] = 0.3;
    importance["availability"] = 0.1;
    importance["rating"] = 0.15;
    importance["dataFreshness"] = 0.05;

    // Adjust based on query mentions
    if (queryLower.includes("cheap") || queryLower.includes("budget")) {
      importance["price"] = 0.6;
    }
    if (queryLower.includes("best") || queryLower.includes("top rated")) {
      importance["rating"] = 0.3;
    }
    if (queryLower.includes("available") || queryLower.includes("in stock")) {
      importance["availability"] = 0.25;
    }

    // Add importance for constraints
    constraints.forEach((c) => {
      importance[c.attribute] = c.importance ?? 0.7;
    });

    // Add importance for preferences
    preferences.forEach((p) => {
      const priorityWeights: Record<string, number> = {
        critical: 0.95,
        high: 0.7,
        medium: 0.5,
        low: 0.2,
      };
      importance[p.attribute] = priorityWeights[p.priority] ?? 0.5;
    });

    // Normalize to sum to 1.0
    const total = Object.values(importance).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(importance).forEach((k) => {
        importance[k] = importance[k] / total;
      });
    }

    return importance;
  }

  private detectTradeoffs(query: string): Tradeoff[] {
    const tradeoffs: Tradeoff[] = [];
    const queryLower = query.toLowerCase();

    // Common tradeoffs
    if (
      (queryLower.includes("storage") && queryLower.includes("compromise")) ||
      queryLower.includes("flexible")
    ) {
      tradeoffs.push({
        from: "storage",
        to: "price",
        reason: "User willing to compromise on storage for better price",
      });
    }

    if (
      queryLower.includes("battery") &&
      queryLower.includes("performance")
    ) {
      tradeoffs.push({
        from: "batteryLife",
        to: "performance",
        reason: "Performance vs battery life trade-off noted",
      });
    }

    return tradeoffs;
  }

  private extractIntendedUse(query: string): string | undefined {
    const queryLower = query.toLowerCase();

    if (queryLower.includes("programming") || queryLower.includes("coding")) {
      return "Software development and programming";
    }
    if (queryLower.includes("machine learning") || queryLower.includes("ai")) {
      return "Machine learning and AI tasks";
    }
    if (queryLower.includes("gaming")) {
      return "Gaming";
    }
    if (queryLower.includes("work") || queryLower.includes("office")) {
      return "Professional work and office tasks";
    }
    if (queryLower.includes("content creation") || queryLower.includes("video")) {
      return "Content creation and video editing";
    }
    if (queryLower.includes("casual") || queryLower.includes("everyday")) {
      return "Casual everyday use";
    }

    return undefined;
  }

  private generateClarificationQuestions(
    query: string,
    constraints: Constraint[],
    budgetInfo: { amount?: number; currency: string }
  ): string[] {
    const questions: string[] = [];
    const queryLower = query.toLowerCase();

    if (budgetInfo.amount === undefined) {
      questions.push(
        "What's your budget range? (e.g., $500-$1000)"
      );
    }

    if (!queryLower.includes("brand") && !queryLower.includes("prefer")) {
      questions.push(
        "Do you have a preferred brand or are all brands acceptable?"
      );
    }

    if (!queryLower.includes("color") && !queryLower.includes("style")) {
      questions.push(
        "Any preferences for color, design, or build quality?"
      );
    }

    return questions;
  }
}

export const preferenceExtractor = new PreferenceExtractor();
