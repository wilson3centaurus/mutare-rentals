import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: property, error } = await supabase
      .from("Property")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await supabase
      .from("Property")
      .update({ views: (property.views ?? 0) + 1, updatedAt: new Date().toISOString() })
      .eq("id", id);

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

    const { data: property, error } = await supabase
      .from("Property")
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ property });
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

