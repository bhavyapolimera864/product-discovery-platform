import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/productService";
import { z } from "zod";

const SearchRequestSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  category: z.enum(["laptops", "smartphones", "headphones", "appliances", "cameras"]).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = SearchRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          errors: Object.fromEntries(
            validation.error.issues.map((issue) => [
              issue.path.join(".") || "root",
              issue.message,
            ])
          ),
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const searchRequest = {
      query: validation.data.query,
      category: validation.data.category,
      limit: validation.data.limit || 20,
      offset: validation.data.offset || 0,
      userId: validation.data.userId || "anonymous",
    };

    // Perform search
    const results = await productService.search(searchRequest);

    return NextResponse.json(
      {
        success: true,
        data: results,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Search failed",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
