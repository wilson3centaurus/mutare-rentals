import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropertyType, PropertyStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const suburb = searchParams.get("suburb");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");
  const propertyType = searchParams.get("propertyType");
  const status = searchParams.get("status") ?? "AVAILABLE";
  const userId = searchParams.get("userId");

  try {
    const properties = await prisma.property.findMany({
      where: {
        ...(suburb && { suburb }),
        ...(userId && { userId }),
        ...(propertyType && { propertyType: propertyType as PropertyType }),
        ...(status && { status: status as PropertyStatus }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
                ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
              },
            }
          : {}),
        ...(bedrooms ? { bedrooms: parseInt(bedrooms) } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        address: body.address,
        suburb: body.suburb,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        price: parseFloat(body.price),
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        propertyType: body.propertyType ?? "HOUSE",
        amenities: body.amenities ?? [],
        images: body.images ?? [],
        hasWater: body.hasWater ?? false,
        hasElectricity: body.hasElectricity ?? false,
        hasRefuseCollection: body.hasRefuseCollection ?? false,
        hasSecurity: body.hasSecurity ?? false,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        ...(body.userId && { userId: body.userId }),
      },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
