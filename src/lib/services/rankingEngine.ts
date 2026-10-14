import { Product, UserPreference, Recommendation, Constraint } from "@/types";

/**
 * Personalized Product Ranking Engine
 * Combines multiple ranking signals with configurable weights
 */

export interface RankingWeights {
  priceMatch: number;
  specificationMatch: number;
  semanticRelevance: number;
  availability: number;
  rating: number;
  dataFreshness: number;
}

const DEFAULT_WEIGHTS: RankingWeights = {
  priceMatch: 0.25,
  specificationMatch: 0.35,
  semanticRelevance: 0.15,
  availability: 0.1,
  rating: 0.1,
  dataFreshness: 0.05,
};

class RankingEngine {
  private weights: RankingWeights = DEFAULT_WEIGHTS;

  /**
   * Rank products based on user preferences
   */
  async rank(
    products: Product[],
    preferences: UserPreference,
    customWeights?: Partial<RankingWeights>
  ): Promise<Recommendation[]> {
    const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

    // 1. Filter products that violate hard constraints
    const constraintViolations = new Map<number, string[]>();
    const eligibleProducts = products.filter((product, idx) => {
      const violations = this.checkHardConstraints(product, preferences);
      if (violations.length > 0) {
        constraintViolations.set(idx, violations);
        return false;
      }
      return true;
    });

    // 2. Score eligible products
    const scores = eligibleProducts.map((product) => {
      const scoreBreakdown = {
        priceMatch: this.scorePriceMatch(product, preferences) * weights.priceMatch,
        specificationMatch: this.scoreSpecificationMatch(product, preferences) * weights.specificationMatch,
        semanticRelevance: this.scoreSemanticRelevance(product, preferences) * weights.semanticRelevance,
        availability: this.scoreAvailability(product) * weights.availability,
        rating: this.scoreRating(product) * weights.rating,
        dataFreshness: this.scoreDataFreshness(product) * weights.dataFreshness,
      };

      const totalScore =
        Object.values(scoreBreakdown).reduce((a, b) => a + b, 0) * 100;

      return {
        product,
        scoreBreakdown,
        totalScore,
      };
    });

    // 3. Sort by score (descending)
    scores.sort((a, b) => b.totalScore - a.totalScore);

    // 4. Generate explanations and recommendations
    const recommendations = scores.map((item, rank) => {
      const explanation = this.generateExplanation(
        item.product,
        preferences,
        item.scoreBreakdown,
        item.totalScore
      );

      return {
        product: item.product,
        rank: rank + 1,
        score: Math.round(item.totalScore),
        scoreBreakdown: {
          priceMatch: Math.round(item.scoreBreakdown.priceMatch * 100) / 100,
          specificationMatch: Math.round(item.scoreBreakdown.specificationMatch * 100) / 100,
          semanticRelevance: Math.round(item.scoreBreakdown.semanticRelevance * 100) / 100,
          availability: Math.round(item.scoreBreakdown.availability * 100) / 100,
          rating: Math.round(item.scoreBreakdown.rating * 100) / 100,
          dataFreshness: Math.round(item.scoreBreakdown.dataFreshness * 100) / 100,
        },
        explanation,
        constraintViolations: undefined,
        relevanceMatches: this.findRelevanceMatches(item.product, preferences),
        tradeoffs: this.identifyTradeoffs(item.product, preferences),
      };
    });

    return recommendations;
  }

  /**
   * Check if product violates hard constraints
   */
  private checkHardConstraints(
    product: Product,
    preferences: UserPreference
  ): string[] {
    const violations: string[] = [];

    const hardConstraints = preferences.constraints.filter(
      (c) => c.type === "hard"
    );

    for (const constraint of hardConstraints) {
      if (!this.satisfiesConstraint(product, constraint)) {
        violations.push(`${constraint.attribute}: ${this.constraintToString(constraint)}`);
      }
    }

    // Price constraint
    if (preferences.budget !== undefined) {
      if (product.price !== undefined && product.price > preferences.budget) {
        violations.push(`Price exceeds budget of ${preferences.budget} ${preferences.budgetCurrency}`);
      }
    }

    return violations;
  }

  /**
   * Check if product satisfies a single constraint
   */
  private satisfiesConstraint(product: Product, constraint: Constraint): boolean {
    const value = this.getProductAttribute(product, constraint.attribute);

    if (value === undefined || value === null) {
      // Treat missing attributes as non-satisfying for hard constraints
      return false;
    }

    switch (constraint.operator) {
      case "===":
        return value === constraint.value;
      case ">=":
        return Number(value) >= Number(constraint.value);
      case "<=":
        return Number(value) <= Number(constraint.value);
      case ">":
        return Number(value) > Number(constraint.value);
      case "<":
        return Number(value) < Number(constraint.value);
      case "in":
        return Array.isArray(constraint.value) && constraint.value.includes(value);
      case "contains":
        return String(value).toLowerCase().includes(String(constraint.value).toLowerCase());
      default:
        return true;
    }
  }

  /**
   * Score price match (0-1)
   */
  private scorePriceMatch(product: Product, preferences: UserPreference): number {
    if (product.price === undefined || preferences.budget === undefined) {
      return 0.5; // Neutral score if price or budget missing
    }

    const ratio = product.price / preferences.budget;

    if (ratio <= 1) {
      // Within budget - score increases with how close to budget
      return Math.min(1, 0.5 + ratio / 2);
    } else if (ratio <= 1.2) {
      // Slightly over budget - still acceptable
      return 0.8;
    } else if (ratio <= 1.5) {
      // Moderately over budget
      return 0.5;
    } else {
      // Significantly over budget
      return 0.2;
    }
  }

  /**
   * Score specification match (0-1)
   */
  private scoreSpecificationMatch(
    product: Product,
    preferences: UserPreference
  ): number {
    if (!product.specifications || preferences.preferences.length === 0) {
      return 0.5;
    }

    let matchedAttributes = 0;
    let totalAttributes = preferences.preferences.length;

    for (const pref of preferences.preferences) {
      const productValue = this.getProductAttribute(product, pref.attribute);
      if (productValue !== undefined && productValue !== null) {
        matchedAttributes++;
      }
    }

    // Base score from attribute presence
    let score = totalAttributes > 0 ? matchedAttributes / totalAttributes : 0.5;

    // Bonus if specifications are substantial
    const specCount = Object.keys(product.specifications || {}).length;
    if (specCount > 5) {
      score = Math.min(1, score + 0.1);
    }

    return score;
  }

  /**
   * Score semantic relevance (0-1)
   * In a full implementation, this would use embedding similarity
   */
  private scoreSemanticRelevance(
    product: Product,
    preferences: UserPreference
  ): number {
    let score = 0.5; // Default neutral

    // Simple heuristic: check if intended use matches product category/description
    if (preferences.intendedUse && product.description) {
      const descLower = product.description.toLowerCase();
      const useLower = preferences.intendedUse.toLowerCase();

      if (descLower.includes(useLower) || useLower.includes("programming")) {
        // Programming laptops should match coding/ML intent
        if (
          product.category === "laptops" &&
          (useLower.includes("programming") || useLower.includes("development"))
        ) {
          score = 0.9;
        } else {
          score = 0.8;
        }
      }
    }

    // Category match
    if (preferences.category && product.category === preferences.category) {
      score = Math.max(score, 0.75);
    }

    return score;
  }

  /**
   * Score availability (0-1)
   */
  private scoreAvailability(product: Product): number {
    if (!product.inStock || product.status !== "current") {
      return 0.3;
    }

    if (product.availability === "in_stock") {
      return 1.0;
    } else if (product.availability === "preorder") {
      return 0.6;
    } else if (product.availability === "unknown") {
      return 0.5;
    } else {
      return 0.2;
    }
  }

  /**
   * Score product rating (0-1, normalized from 0-5)
   */
  private scoreRating(product: Product): number {
    if (product.rating === undefined) {
      return 0.5;
    }

    // Normalize 0-5 to 0-1, with confidence based on review count
    const normalizedRating = Math.max(0, Math.min(1, product.rating / 5));

    // Apply confidence factor based on review count
    const confidence = Math.min(1, (product.reviewCount || 0) / 100);
    const confidenceAdjustment = 0.5 + confidence * 0.5;

    return normalizedRating * confidenceAdjustment;
  }

  /**
   * Score data freshness (0-1)
   */
  private scoreDataFreshness(product: Product): number {
    if (product.status === "current") {
      return 1.0;
    } else if (product.status === "stale") {
      return 0.6;
    } else if (product.status === "unavailable") {
      return 0.2;
    } else {
      return 0.1;
    }
  }

  /**
   * Get product attribute value (case-insensitive)
   */
  private getProductAttribute(product: Product, attribute: string): any {
    const attrLower = attribute.toLowerCase();

    // Direct properties
    const directProps: Record<string, any> = {
      name: product.name,
      brand: product.brand,
      price: product.price,
      rating: product.rating,
      category: product.category,
    };

    if (attrLower in directProps) {
      return directProps[attrLower];
    }

    // Specifications
    if (product.specifications) {
      for (const [key, value] of Object.entries(product.specifications)) {
        if (key.toLowerCase() === attrLower) {
          return value;
        }
      }
    }

    return undefined;
  }

  /**
   * Generate explanation for why product was ranked this way
   */
  private generateExplanation(
    product: Product,
    preferences: UserPreference,
    scoreBreakdown: Record<string, number>,
    totalScore: number
  ): string {
    const parts: string[] = [];

    // Strongest scoring factor
    const scores = Object.entries(scoreBreakdown).sort((a, b) => b[1] - a[1]);
    if (scores.length > 0 && scores[0][1] > 0) {
      const [factor, score] = scores[0];
      if (score > 0.7) {
        parts.push(`Strong match on ${factor.replace(/([A-Z])/g, " $1").toLowerCase()}`);
      }
    }

    // Price consideration
    if (product.price && preferences.budget) {
      const percentOfBudget = Math.round((product.price / preferences.budget) * 100);
      if (percentOfBudget <= 100) {
        parts.push(`${percentOfBudget}% of budget`);
      } else {
        parts.push(`${percentOfBudget - 100}% above budget`);
      }
    }

    // Availability
    if (!product.inStock) {
      parts.push("Currently unavailable");
    }

    // Rating
    if (product.rating) {
      parts.push(`${product.rating.toFixed(1)}/5 rating (${product.reviewCount} reviews)`);
    }

    return parts.length > 0
      ? parts.join(" • ")
      : `Matches your search criteria with an overall score of ${totalScore}/100`;
  }

  /**
   * Find which preferences are matched by the product
   */
  private findRelevanceMatches(
    product: Product,
    preferences: UserPreference
  ): string[] {
    const matches: string[] = [];

    for (const pref of preferences.preferences) {
      const value = this.getProductAttribute(product, pref.attribute);
      if (value !== undefined && value !== null) {
        matches.push(`${pref.attribute}: ${value}`);
      }
    }

    return matches;
  }

  /**
   * Identify potential trade-offs
   */
  private identifyTradeoffs(
    product: Product,
    preferences: UserPreference
  ): string[] {
    const tradeoffs: string[] = [];

    // Price vs quality trade-off
    if (product.price && preferences.budget) {
      if (product.price < preferences.budget * 0.7 && product.rating && product.rating < 4) {
        tradeoffs.push("Lower price at the cost of lower ratings");
      }
    }

    // Storage vs price
    const storage = this.getProductAttribute(product, "storage");
    if (storage && storage < 256 && product.price) {
      tradeoffs.push("Limited storage to keep price low");
    }

    // Battery life vs performance
    if (product.category === "laptops") {
      const batteryLife = this.getProductAttribute(product, "batteryLife");
      const processor = this.getProductAttribute(product, "cpu") || this.getProductAttribute(product, "processor");
      if (batteryLife && processor && batteryLife < "10h") {
        tradeoffs.push("High-performance processor may affect battery life");
      }
    }

    return tradeoffs;
  }

  /**
   * Convert constraint to readable string
   */
  private constraintToString(constraint: Constraint): string {
    switch (constraint.operator) {
      case "===":
        return `must be ${constraint.value}`;
      case ">=":
        return `at least ${constraint.value}`;
      case "<=":
        return `at most ${constraint.value}`;
      case ">":
        return `greater than ${constraint.value}`;
      case "<":
        return `less than ${constraint.value}`;
      case "in":
        return `must be one of ${constraint.value.join(", ")}`;
      case "contains":
        return `must contain ${constraint.value}`;
      default:
        return `must match ${constraint.value}`;
    }
  }

  /**
   * Set custom ranking weights
   */
  setWeights(weights: Partial<RankingWeights>): void {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /**
   * Get current weights
   */
  getWeights(): RankingWeights {
    return { ...this.weights };
  }
}

export const rankingEngine = new RankingEngine();
