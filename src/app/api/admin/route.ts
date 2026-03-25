import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      { count: totalUsers },
      { count: totalProperties },
      { count: totalPredictions },
      { count: totalRequisitions },
      { data: users },
      { data: propertiesWithUsers },
      { data: transactions },
      { data: requisitions },
      { data: recentPredictions },
    ] = await Promise.all([
      supabase.from("User").select("*", { count: "exact", head: true }),
      supabase.from("Property").select("*", { count: "exact", head: true }),
      supabase.from("PricePrediction").select("*", { count: "exact", head: true }),
      supabase.from("Requisition").select("*", { count: "exact", head: true }),
      supabase.from("User").select("id, name, email, role, phone, createdAt").order("createdAt", { ascending: false }),
      supabase.from("Property").select("*, user:User!userId(name, email)").order("createdAt", { ascending: false }).limit(20),
      supabase.from("Transaction").select("*, property:Property!propertyId(title, suburb), buyer:User!buyerId(name)").order("createdAt", { ascending: false }).limit(20),
      supabase.from("Requisition").select("*, user:User!userId(name, email)").order("createdAt", { ascending: false }).limit(20),
      supabase.from("PricePrediction").select("*").order("createdAt", { ascending: false }).limit(10),
    ]);

    // Property count per user for the user list
    const { data: propCountRows } = await supabase.from("Property").select("userId");
    const propCountByUser = new Map<string, number>();
    for (const row of (propCountRows ?? [])) {
      if (row.userId) propCountByUser.set(row.userId, (propCountByUser.get(row.userId) ?? 0) + 1);
    }
    const recentUsers = (users ?? []).slice(0, 10).map((u) => ({ ...u, _count: { properties: propCountByUser.get(u.id) ?? 0 } }));
    const allUsers = (users ?? []).map((u) => ({ ...u, _count: { properties: propCountByUser.get(u.id) ?? 0 } }));

    // Aggregate suburb + algorithm stats from the full Property table
    const { data: allPropsForStats } = await supabase.from("Property").select("suburb, algorithm, price");
    const props = allPropsForStats ?? [];

    const suburbMap = new Map<string, { count: number; total: number }>();
    const algorithmMap = new Map<string, { count: number; total: number }>();
    for (const p of props) {
      const s = suburbMap.get(p.suburb) ?? { count: 0, total: 0 };
      s.count++; s.total += p.price; suburbMap.set(p.suburb, s);
      const a = algorithmMap.get(p.algorithm) ?? { count: 0, total: 0 };
      a.count++; a.total += p.price; algorithmMap.set(p.algorithm, a);
    }
    const suburbStats = [...suburbMap.entries()]
      .map(([suburb, { count, total }]) => ({ suburb, _count: { id: count }, _avg: { price: count > 0 ? total / count : 0 } }))
      .sort((a, b) => b._count.id - a._count.id);
    const algorithmStats = [...algorithmMap.entries()]
      .map(([algorithm, { count, total }]) => ({ algorithm, _count: { id: count }, _avg: { price: count > 0 ? total / count : 0 } }));

    return NextResponse.json({
      stats: { totalUsers: totalUsers ?? 0, totalProperties: totalProperties ?? 0, totalPredictions: totalPredictions ?? 0, totalRequisitions: totalRequisitions ?? 0 },
      recentUsers,
      users: allUsers,
      propertiesWithUsers: propertiesWithUsers ?? [],
      transactions: transactions ?? [],
      suburbStats,
      algorithmStats,
      requisitions: requisitions ?? [],
      recentPredictions: recentPredictions ?? [],
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
}
