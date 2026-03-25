import { NextResponse } from "next/server";
import { predictPrice, PricingAlgorithm } from "@/lib/prediction";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const algorithm: PricingAlgorithm = body.algorithm ?? "HEDONIC";

    const result = predictPrice({
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

    // Persist prediction log (best-effort — don't fail the response if DB is unreachable)
    supabase.from("PricePrediction").insert({
      id: randomUUID(),
      suburb: body.suburb,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
      hasWater: body.hasWater ?? false,
      hasElectricity: body.hasElectricity ?? false,
      hasSecurity: body.hasSecurity ?? false,
      algorithm,
      predictedPrice: result.predictedPrice,
      confidence: result.confidence,
      createdAt: new Date().toISOString(),
    }).then(undefined, (e: unknown) => console.warn("pricePrediction log skipped:", e));

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/predict error:", error);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
