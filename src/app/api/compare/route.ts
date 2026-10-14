import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/productService";
import { preferenceExtractor } from "@/lib/services/preferenceExtractor";
import { z } from "zod";

const CompareRequestSchema = z.object({
  productIds: z.array(z.string()).min(2, "At least 2 products required to compare"),
  userQuery: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = CompareRequestSchema.safeParse(body);
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

    // Extract preferences if user query provided
    let preferences = null;
    if (validation.data.userQuery) {
      preferences = await preferenceExtractor.extract(validation.data.userQuery);
    }

    // Perform comparison
    const comparison = await productService.compare(
      validation.data.productIds,
      preferences || {
        userId: validation.data.userId || "anonymous",
        rawQuery: validation.data.userQuery || "",
        constraints: [],
        preferences: [],
        importance: {},
        tradeoffs: [],
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: comparison,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Comparison failed",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
