import { NextResponse } from "next/server";
import { predictPrice } from "@/lib/prediction";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = predictPrice({
      suburb: body.suburb,
      bedrooms: parseInt(body.bedrooms),
      bathrooms: parseInt(body.bathrooms),
      squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : undefined,
      propertyType: body.propertyType ?? "HOUSE",
      hasWater: body.hasWater ?? false,
      hasElectricity: body.hasElectricity ?? false,
      hasRefuseCollection: body.hasRefuseCollection ?? false,
      hasSecurity: body.hasSecurity ?? false,
      yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : undefined,
    });

    // Persist prediction log
    await prisma.pricePrediction.create({
      data: {
        suburb: body.suburb,
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseInt(body.bathrooms),
        squareMeters: body.squareMeters ? parseFloat(body.squareMeters) : null,
        hasWater: body.hasWater ?? false,
        hasElectricity: body.hasElectricity ?? false,
        hasSecurity: body.hasSecurity ?? false,
        predictedPrice: result.predictedPrice,
        confidence: result.confidence,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/predict error:", error);
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 });
  }
}
