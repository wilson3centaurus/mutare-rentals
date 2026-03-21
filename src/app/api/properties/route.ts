import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PropertyType, PropertyStatus, ListingType } from "@prisma/client";
import { predictPrice, PricingAlgorithm } from "@/lib/prediction";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const suburb = searchParams.get("suburb");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");
  const propertyType = searchParams.get("propertyType");
  const listingType = searchParams.get("listingType");
  const status = searchParams.get("status") ?? "AVAILABLE";
  const userId = searchParams.get("userId");
  const hasWifi = searchParams.get("hasWifi");
  const hasPool = searchParams.get("hasPool");
  const hasBorehole = searchParams.get("hasBorehole");
  const houseConstruction = searchParams.get("houseConstruction");

  try {
    const properties = await prisma.property.findMany({
      where: {
        ...(suburb && { suburb }),
        ...(userId && { userId }),
        ...(propertyType && { propertyType: propertyType as PropertyType }),
        ...(listingType && { listingType: listingType as ListingType }),
        ...(status && { status: status as PropertyStatus }),
        ...(minPrice || maxPrice ? {
          price: {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
          },
        } : {}),
        ...(bedrooms ? { bedrooms: { gte: parseInt(bedrooms) } } : {}),
        ...(hasWifi === "true" ? { hasWifi: true } : {}),
        ...(hasPool === "true" ? { hasPool: true } : {}),
        ...(hasBorehole === "true" ? { hasBorehole: true } : {}),
        ...(houseConstruction ? { houseConstruction: houseConstruction as never } : {}),
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

    // Auto-predict price using chosen algorithm
    const algorithm: PricingAlgorithm = body.algorithm ?? "HEDONIC";
    const prediction = predictPrice({
      suburb: body.suburb,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : undefined,
      propertyType: body.propertyType ?? "HOUSE",
      listingType: body.listingType ?? "WHOLE_HOUSE",
      hasWater: body.hasWater ?? false,
      hasElectricity: body.hasElectricity ?? false,
      hasRefuseCollection: body.hasRefuseCollection ?? false,
      hasSecurity: body.hasSecurity ?? false,
      hasWifi: body.hasWifi ?? false,
      hasBorehole: body.hasBorehole ?? false,
      hasDriveway: body.hasDriveway ?? false,
      hasPool: body.hasPool ?? false,
      hasGenerator: body.hasGenerator ?? false,
      hasSolarPower: body.hasSolarPower ?? false,
      yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : undefined,
      houseConstruction: body.houseConstruction ?? "BRICK",
      roofType: body.roofType ?? "IRON_SHEETS",
      windowCondition: body.windowCondition ?? "GOOD",
      wallCondition: body.wallCondition ?? "GOOD",
      bathroomType: body.bathroomType ?? "SHOWER_ONLY",
      algorithm,
    });

    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        address: body.address,
        suburb: body.suburb,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        price: prediction.predictedPrice, // always algorithm-set
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        propertyType: body.propertyType ?? "HOUSE",
        listingType: body.listingType ?? "WHOLE_HOUSE",
        houseConstruction: body.houseConstruction ?? "BRICK",
        roofType: body.roofType ?? "IRON_SHEETS",
        windowCondition: body.windowCondition ?? "GOOD",
        wallCondition: body.wallCondition ?? "GOOD",
        bathroomType: body.bathroomType ?? "SHOWER_ONLY",
        algorithm,
        amenities: body.amenities ?? [],
        images: body.images ?? [],
        hasWater: body.hasWater ?? false,
        hasElectricity: body.hasElectricity ?? false,
        hasRefuseCollection: body.hasRefuseCollection ?? false,
        hasSecurity: body.hasSecurity ?? false,
        hasWifi: body.hasWifi ?? false,
        hasBorehole: body.hasBorehole ?? false,
        hasDriveway: body.hasDriveway ?? false,
        hasPool: body.hasPool ?? false,
        hasGenerator: body.hasGenerator ?? false,
        hasSolarPower: body.hasSolarPower ?? false,
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail,
        contactRole: body.contactRole ?? "LANDLORD",
        ...(body.userId && { userId: body.userId }),
      },
    });

    return NextResponse.json({ property, prediction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
