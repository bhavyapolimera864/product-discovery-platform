import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/productService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await productService.getProductById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          timestamp: new Date(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
