import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { predictPrice, type PricingAlgorithm } from "@/lib/prediction";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const skipViewIncrement = searchParams.get("mode") === "edit";
    const { data: property, error } = await supabase
      .from("Property")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (!skipViewIncrement) {
      await supabase
        .from("Property")
        .update({ views: (property.views ?? 0) + 1, updatedAt: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("GET /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: property, error } = await supabase
      .from("Property")
      .update({
        title: body.title,
        description: body.description ?? null,
        address: body.address,
        suburb: body.suburb,
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        price: prediction.predictedPrice,
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
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ property, prediction });
  } catch (error) {
    console.error("PUT /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase.from("Property").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ message: "Property deleted" });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

