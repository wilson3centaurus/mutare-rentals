import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { predictPrice, PricingAlgorithm } from "@/lib/prediction";
import { randomUUID } from "crypto";

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
    let query = supabase
      .from("Property")
      .select("*, user:User!userId(name, email)")
      .order("createdAt", { ascending: false });

    if (suburb) query = query.eq("suburb", suburb);
    if (userId) query = query.eq("userId", userId);
    if (propertyType) query = query.eq("propertyType", propertyType);
    if (listingType) query = query.eq("listingType", listingType);
    if (status) query = query.eq("status", status);
    if (minPrice) query = query.gte("price", parseFloat(minPrice));
    if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
    if (bedrooms) query = query.gte("bedrooms", parseInt(bedrooms));
    if (hasWifi === "true") query = query.eq("hasWifi", true);
    if (hasPool === "true") query = query.eq("hasPool", true);
    if (hasBorehole === "true") query = query.eq("hasBorehole", true);
    if (houseConstruction) query = query.eq("houseConstruction", houseConstruction);

    const { data: properties, error } = await query;
    if (error) throw error;

    return NextResponse.json({ properties: properties ?? [] });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to fetch properties", detail: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    const now = new Date().toISOString();
    const { data: property, error } = await supabase
      .from("Property")
      .insert({
        id: randomUUID(),
        title: body.title,
        description: body.description ?? null,
        address: body.address,
        suburb: body.suburb,
        city: "Mutare",
        province: "Manicaland",
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        price: prediction.predictedPrice,
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        propertyType: body.propertyType ?? "HOUSE",
        listingType: body.listingType ?? "WHOLE_HOUSE",
        status: "AVAILABLE",
        amenities: body.amenities ?? [],
        images: body.images ?? [],
        houseConstruction: body.houseConstruction ?? "BRICK",
        roofType: body.roofType ?? "IRON_SHEETS",
        windowCondition: body.windowCondition ?? "GOOD",
        wallCondition: body.wallCondition ?? "GOOD",
        bathroomType: body.bathroomType ?? "SHOWER_ONLY",
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
        algorithm,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        contactEmail: body.contactEmail ?? null,
        contactRole: body.contactRole ?? "LANDLORD",
        userId: body.userId ?? null,
        views: 0,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ property, prediction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/properties error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create property", detail: message },
      { status: 500 }
    );
  }
}
