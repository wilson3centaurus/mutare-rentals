import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { predictPrice } from "@/lib/prediction";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  try {
    if (all === "true" && session?.user?.role === "ADMIN") {
      const { data: requisitions, error } = await supabase
        .from("Requisition")
        .select("*, user:User!userId(name, email)")
        .order("createdAt", { ascending: false });
      if (error) throw error;
      return NextResponse.json({ requisitions: requisitions ?? [] });
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: requisitions, error } = await supabase
      .from("Requisition")
      .select("*")
      .eq("userId", session.user.id)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ requisitions: requisitions ?? [] });
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

    const now = new Date().toISOString();
    const { data: requisition, error } = await supabase
      .from("Requisition")
      .insert({
        id: randomUUID(),
        userId: session?.user?.id ?? null,
        suburb: body.suburb ?? null,
        propertyType: body.propertyType ?? null,
        listingType: body.listingType ?? null,
        minBedrooms: body.minBedrooms ? parseInt(body.minBedrooms) : null,
        maxBedrooms: body.maxBedrooms ? parseInt(body.maxBedrooms) : null,
        maxBudget: body.maxBudget ? parseFloat(body.maxBudget) : null,
        hasWater: body.hasWater ?? null,
        hasElectricity: body.hasElectricity ?? null,
        hasSecurity: body.hasSecurity ?? null,
        hasWifi: body.hasWifi ?? null,
        notes: body.notes ?? null,
        status: "OPEN",
        estimatedMin,
        estimatedMax,
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ requisition, estimatedMin, estimatedMax }, { status: 201 });
  } catch (error) {
    console.error("POST /api/requisitions error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to submit requisition", detail: message }, { status: 500 });
  }
}
