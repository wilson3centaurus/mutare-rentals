import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalProperties,
      availableProperties,
      avgPriceResult,
      suburbCounts,
      recentProperties,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: "AVAILABLE" } }),
      prisma.property.aggregate({ _avg: { price: true } }),
      prisma.property.groupBy({
        by: ["suburb"],
        _count: { id: true },
        _avg: { price: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.property.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalProperties,
      availableProperties,
      avgPrice: avgPriceResult._avg.price ?? 0,
      suburbStats: suburbCounts.map((s) => ({
        suburb: s.suburb,
        count: s._count.id,
        avgPrice: Math.round(s._avg.price ?? 0),
      })),
      recentProperties,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
