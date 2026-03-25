import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { predictPrice } from "@/lib/prediction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

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

    const { data: property, error: propError } = await supabase
      .from("Property")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

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

    const now = new Date().toISOString();
    const { data: transaction, error: txError } = await supabase
      .from("Transaction")
      .insert({
        id: randomUUID(),
        propertyId,
        buyerId: buyerId || null,
        listedPrice: property.price,
        soldPrice: parseFloat(soldPrice),
        predictedPrice: prediction.predictedPrice,
        status: "SOLD",
        listedAt: now,
        soldAt: now,
        createdAt: now,
      })
      .select()
      .single();

    if (txError) throw txError;

    await supabase
      .from("Property")
      .update({ status: "RENTED", updatedAt: now })
      .eq("id", propertyId);

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/transactions error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
