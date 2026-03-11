import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

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

    const property = await prisma.property.update({
      where: { id },
      data: body,
    });

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

    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ message: "Property deleted" });
  } catch (error) {
    console.error("DELETE /api/properties/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
