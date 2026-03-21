import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [
      totalUsers,
      totalProperties,
      totalPredictions,
      totalRequisitions,
      recentUsers,
      users,
      propertiesWithUsers,
      transactions,
      suburbStats,
      algorithmStats,
      requisitions,
      recentPredictions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.pricePrediction.count(),
      prisma.requisition.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true, name: true, email: true, role: true,
          phone: true, createdAt: true,
          _count: { select: { properties: true } },
        },
      }),
      prisma.user.findMany({
        select: {
          id: true, name: true, email: true, role: true,
          createdAt: true, _count: { select: { properties: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.property.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.transaction.findMany({
        include: {
          property: { select: { title: true, suburb: true } },
          buyer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.property.groupBy({
        by: ["suburb"],
        _count: { id: true },
        _avg: { price: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.property.groupBy({
        by: ["algorithm"],
        _count: { id: true },
        _avg: { price: true },
      }),
      prisma.requisition.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.pricePrediction.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      stats: { totalUsers, totalProperties, totalPredictions, totalRequisitions },
      recentUsers,
      users,
      propertiesWithUsers,
      transactions,
      suburbStats,
      algorithmStats,
      requisitions,
      recentPredictions,
    });
  } catch (error) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
}
