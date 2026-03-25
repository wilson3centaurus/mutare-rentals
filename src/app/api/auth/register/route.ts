import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const { data: user, error } = await supabase
      .from("User")
      .insert({
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "USER",
        createdAt: now,
        updatedAt: now,
      })
      .select("id, name, email, role")
      .single();

    if (error) throw error;

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
