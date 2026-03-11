import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { predictPrice } from "@/lib/prediction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, soldPrice, buyerId } = body;

    if (!propertyId || !soldPrice) {
      return NextResponse.json({ error: "propertyId and soldPrice required" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get AI predicted price for this property
    const prediction = predictPrice({
      suburb: property.suburb,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareMeters: property.squareMeters ?? undefined,
      propertyType: property.propertyType,
      hasWater: property.hasWater,
      hasElectricity: property.hasElectricity,
      hasRefuseCollection: property.hasRefuseCollection,
      hasSecurity: property.hasSecurity,
      yearBuilt: property.yearBuilt ?? undefined,
    });

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        propertyId,
        buyerId: buyerId || null,
        listedPrice: property.price,
        soldPrice: parseFloat(soldPrice),
        predictedPrice: prediction.predictedPrice,
        status: "SOLD",
        soldAt: new Date(),
      },
    });

    // Update property status
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: "RENTED" },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
