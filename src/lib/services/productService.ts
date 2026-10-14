import { db } from "@/db";
import { products as productsTable } from "@/db/schema";
import { eq, like, and, desc, or as drizzleOr, lt } from "drizzle-orm";
import {
  Product,
  SearchRequest,
  SearchResponse,
  Recommendation,
  UserPreference,
} from "@/types";
import { mockProvider } from "@/lib/providers/mockProvider";
import { preferenceExtractor } from "@/lib/services/preferenceExtractor";
import { rankingEngine } from "@/lib/services/rankingEngine";

/**
 * Product Discovery Service
 * Orchestrates product retrieval, preference extraction, and ranking
 */

class ProductService {
  /**
   * Perform a complete product discovery search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    // 1. Extract preferences from natural language query
    const preferences = await preferenceExtractor.extract(request.query);

    // 2. Validate preferences
    const validation = await preferenceExtractor.validate(preferences);
    if (!validation.valid) {
      return {
        query: request.query,
        preference: preferences,
        results: [],
        totalCount: 0,
        errors: validation.errors,
      };
    }

    // 3. Retrieve products
    let products: Product[] = [];

    // Try to retrieve from database first (only if DB is available)
    let dbProducts: Product[] = [];
    if (db) {
      dbProducts = await this.getProductsFromDB(request, preferences);
    }

    if (dbProducts.length === 0) {
      // Fall back to mock provider for development / when DB is unavailable
      const mockResults = await mockProvider.search(request.query, request.limit || 20);
      products = mockResults.map((p) => ({
        ...p,
        id: `${p.source}_${p.productId}`,
      }));

      // Cache products in DB if available
      if (db) {
        for (const product of products) {
          await this.saveProductToDB(product);
        }
      }
    } else {
      products = dbProducts;
    }

    // 4. Rank products based on preferences
    const recommendations = await rankingEngine.rank(products, preferences);

    // 5. Generate response
    return {
      query: request.query,
      preference: preferences,
      results: recommendations.slice(0, request.limit || 20),
      totalCount: recommendations.length,
      clarificationQuestions: preferences.clarificationQuestions,
      errors: preferences.validationErrors,
    };
  }

  /**
   * Compare multiple products
   */
  async compare(
    productIds: string[],
    preferences: UserPreference
  ): Promise<{
    products: Product[];
    comparison: Record<string, Record<string, any>>;
    tradeoffAnalysis: string;
  }> {
    // Fetch products
    const products = await Promise.all(
      productIds.map((id) => this.getProductById(id))
    );

    const validProducts = products.filter((p): p is Product => p !== null);

    // Build comparison matrix
    const comparison = this.buildComparisonMatrix(validProducts);

    // Generate tradeoff analysis
    const tradeoffAnalysis = await this.generateTradeoffAnalysis(
      validProducts,
      preferences
    );

    return {
      products: validProducts,
      comparison,
      tradeoffAnalysis,
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    // Try database first (only if DB is available)
    if (db) {
      try {
        const dbResult = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.id, parseInt(id) || 0))
          .limit(1);

        if (dbResult.length > 0) {
          return this.dbRowToProduct(dbResult[0]);
        }
      } catch {
        // DB query failed, fall through to mock provider
      }
    }

    // Try mock provider
    return mockProvider.getProduct(id);
  }

  /**
   * Search products in database
   */
  private async getProductsFromDB(
    request: SearchRequest,
    preferences: UserPreference
  ): Promise<Product[]> {
    if (!db) return [];

    try {
      // Apply filters
      const conditions: any[] = [];

      // Category filter
      if (preferences.category && preferences.category !== "other") {
        conditions.push(eq(productsTable.category, preferences.category));
      }

      // Price filter
      if (preferences.budget !== undefined) {
        conditions.push(lt(productsTable.price, String(preferences.budget * 1.1)));
      }

      // Keyword search
      if (request.query) {
        conditions.push(
          drizzleOr(
            like(productsTable.name, `%${request.query}%`),
            like(productsTable.description || "", `%${request.query}%`),
            like(productsTable.brand || "", `%${request.query}%`)
          )
        );
      }

      // Apply status filter - prefer current/fresh products
      conditions.push(eq(productsTable.status, "current"));

      // Build the query
      let query: any;
      if (conditions.length > 0) {
        query = db
          .select()
          .from(productsTable)
          .where(and(...conditions))
          .orderBy(desc(productsTable.rating), desc(productsTable.lastUpdated))
          .limit(request.limit || 20)
          .offset(request.offset || 0);
      } else {
        query = db
          .select()
          .from(productsTable)
          .orderBy(desc(productsTable.rating), desc(productsTable.lastUpdated))
          .limit(request.limit || 20)
          .offset(request.offset || 0);
      }

      const results = await query.execute();
      return results.map((row: any) => this.dbRowToProduct(row));
    } catch {
      return [];
    }
  }

  /**
   * Save product to database
   */
  private async saveProductToDB(product: Product): Promise<void> {
    if (!db) return;

    try {
      const existing = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.productId, product.productId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(productsTable).values({
          productId: product.productId,
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          price: product.price ? String(product.price) : null,
          currency: product.currency,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          specifications: product.specifications,
          source: product.source,
          sourceId: product.sourceId,
          seller: product.seller,
          availability: product.availability,
          inStock: product.inStock,
          rating: product.rating ? String(product.rating) : null,
          reviewCount: product.reviewCount,
          status: product.status,
          dataFreshness: product.dataFreshness,
          metadata: product.metadata,
        });
      }
    } catch (error) {
      console.error("Error saving product to DB:", error);
    }
  }

  /**
   * Convert database row to Product
   */
  private dbRowToProduct(row: any): Product {
    return {
      id: String(row.id),
      productId: row.productId,
      name: row.name,
      brand: row.brand,
      category: row.category,
      description: row.description,
      price: row.price ? parseFloat(row.price) : undefined,
      currency: row.currency || "USD",
      imageUrl: row.imageUrl,
      productUrl: row.productUrl,
      specifications: row.specifications,
      source: row.source,
      sourceId: row.sourceId,
      seller: row.seller,
      availability: row.availability,
      inStock: row.inStock,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewCount: row.reviewCount,
      status: row.status,
      dataFreshness: row.dataFreshness,
      lastUpdated: row.lastUpdated,
      metadata: row.metadata,
    };
  }

  /**
   * Build comparison matrix for products
   */
  private buildComparisonMatrix(
    products: Product[]
  ): Record<string, Record<string, any>> {
    const matrix: Record<string, Record<string, any>> = {};

    // Build matrix
    products.forEach((product) => {
      matrix[product.id] = {
        name: product.name,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        reviewCount: product.reviewCount,
        availability: product.availability,
        inStock: product.inStock,
        ...product.specifications,
      };
    });

    return matrix;
  }

  /**
   * Generate tradeoff analysis
   */
  private async generateTradeoffAnalysis(
    products: Product[],
    preferences: UserPreference
  ): Promise<string> {
    if (products.length < 2) {
      return "Need at least 2 products to compare trade-offs.";
    }

    const parts: string[] = [];

    // Price analysis
    const prices = products
      .filter((p) => p.price !== undefined)
      .map((p) => ({ id: p.id, price: p.price! }))
      .sort((a, b) => a.price - b.price);

    if (prices.length > 1) {
      const cheapest = prices[0];
      const mostExpensive = prices[prices.length - 1];
      const difference = mostExpensive.price - cheapest.price;
      parts.push(
        `Price range: $${cheapest.price} to $${mostExpensive.price} (difference: $${difference})`
      );
    }

    // Rating analysis
    const rated = products.filter((p) => p.rating !== undefined);
    if (rated.length > 1) {
      const bestRated = rated.reduce((a, b) =>
        (a.rating || 0) > (b.rating || 0) ? a : b
      );
      const worstRated = rated.reduce((a, b) =>
        (a.rating || 0) < (b.rating || 0) ? a : b
      );
      parts.push(
        `Rating range: ${worstRated.rating?.toFixed(1)} to ${bestRated.rating?.toFixed(1)} stars`
      );
    }

    // Availability analysis
    const available = products.filter((p) => p.inStock).length;
    if (available < products.length) {
      parts.push(`${available}/${products.length} products currently in stock`);
    }

    return (
      parts.join("\n") ||
      "No significant trade-offs detected between these products."
    );
  }
}

export const productService = new ProductService();
