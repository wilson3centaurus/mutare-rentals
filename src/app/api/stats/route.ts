import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const [
      { count: totalProperties },
      { count: availableProperties },
      { data: allProps },
      { data: recentProperties },
    ] = await Promise.all([
      supabase.from("Property").select("*", { count: "exact", head: true }),
      supabase.from("Property").select("*", { count: "exact", head: true }).eq("status", "AVAILABLE"),
      supabase.from("Property").select("suburb, price"),
      supabase.from("Property").select("id, title, suburb, bedrooms, price, status, images, propertyType, listingType").order("createdAt", { ascending: false }).limit(5),
    ]);

    const props = allProps ?? [];
    const avgPrice = props.length > 0
      ? props.reduce((s: number, p: { price: number }) => s + p.price, 0) / props.length
      : 0;

    const suburbMap = new Map<string, { count: number; total: number }>();
    for (const p of props) {
      const e = suburbMap.get(p.suburb) ?? { count: 0, total: 0 };
      e.count++; e.total += p.price;
      suburbMap.set(p.suburb, e);
    }
    const suburbStats = [...suburbMap.entries()]
      .map(([suburb, { count, total }]) => ({ suburb, count, avgPrice: Math.round(total / count) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      totalProperties: totalProperties ?? 0,
      availableProperties: availableProperties ?? 0,
      avgPrice,
      suburbStats,
      recentProperties: recentProperties ?? [],
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
