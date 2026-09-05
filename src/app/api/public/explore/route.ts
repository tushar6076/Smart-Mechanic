import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Scan the product table and pull unique category items alongside their total counts
    const analyticalGroups = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    // 2. Map over the live database records to build the UI configuration objects dynamically
    const dynamicCategories = analyticalGroups.map((group) => {
      const rawCategory = group.category || "UNASSIGNED";
      
      // Convert the database string into a user-friendly title (e.g., "HEAVY_TOOLING" -> "Heavy Tooling")
      const friendlyName = rawCategory
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return {
        name: friendlyName,
        slug: rawCategory.toLowerCase(),
        count: `${group._count.id} ${group._count.id === 1 ? "Unit" : "Units"}`,
      };
    });

    // 3. Dispatch the live data array structure straight to the page stream
    return NextResponse.json({ categories: dynamicCategories }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed compiling dynamic database overview telemetry:", error);
    return NextResponse.json(
      { error: "DYNAMIC_CATEGORIES_QUERY_FAILURE" },
      { status: 500 }
    );
  }
}