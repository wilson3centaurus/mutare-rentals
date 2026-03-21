import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { predictPrice } from "@/lib/prediction";
import { PropertyType, ListingType } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  try {
    if (all === "true" && session?.user?.role === "ADMIN") {
      const requisitions = await prisma.requisition.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ requisitions });
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requisitions = await prisma.requisition.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ requisitions });
  } catch (error) {
    console.error("GET /api/requisitions error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Compute estimated price range
    const predInput = {
      suburb: body.suburb ?? "CBD",
      bedrooms: body.minBedrooms ?? 2,
      bathrooms: 1,
      propertyType: body.propertyType ?? "HOUSE",
      hasWater: body.hasWater ?? false,
      hasElectricity: body.hasElectricity ?? false,
      hasRefuseCollection: false,
      hasSecurity: body.hasSecurity ?? false,
      hasWifi: body.hasWifi ?? false,
    };
    const estLow = predictPrice({ ...predInput, algorithm: "HEDONIC" });
    const estHigh = predictPrice({ ...predInput, bedrooms: body.maxBedrooms ?? predInput.bedrooms, algorithm: "COMPARABLE_SALES" });

    const estimatedMin = Math.min(estLow.minPrice, estHigh.minPrice);
    const estimatedMax = Math.max(estLow.maxPrice, estHigh.maxPrice);

    const requisition = await prisma.requisition.create({
      data: {
        userId: session?.user?.id ?? null,
        suburb: body.suburb ?? null,
        propertyType: body.propertyType ? (body.propertyType as PropertyType) : null,
        listingType: body.listingType ? (body.listingType as ListingType) : null,
        minBedrooms: body.minBedrooms ? parseInt(body.minBedrooms) : null,
        maxBedrooms: body.maxBedrooms ? parseInt(body.maxBedrooms) : null,
        maxBudget: body.maxBudget ? parseFloat(body.maxBudget) : null,
        hasWater: body.hasWater ?? null,
        hasElectricity: body.hasElectricity ?? null,
        hasSecurity: body.hasSecurity ?? null,
        hasWifi: body.hasWifi ?? null,
        notes: body.notes ?? null,
        estimatedMin,
        estimatedMax,
      },
    });

    return NextResponse.json({ requisition, estimatedMin, estimatedMax }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requisitions error:", error);
    return NextResponse.json({ error: "Failed to submit requisition" }, { status: 500 });
  }
}
