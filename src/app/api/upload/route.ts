import { NextResponse } from "next/server";

// ─── Cloudinary upload helper ───────────────────────────────────────────────
async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars not configured");
  }

  // Build the signed upload request
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=mutare-rentals&timestamp=${timestamp}&upload_preset=ml_default`;

  // HMAC-SHA1 signature using Web Crypto (edge-compatible)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(`${paramsToSign}${apiSecret}`));
  const signature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", "mutare-rentals");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        // Production: upload to Cloudinary
        const url = await uploadToCloudinary(buffer, file.name);
        urls.push(url);
      } else {
        // Dev fallback: return a base64 data URL (won't persist, fine for local dev)
        const mime = file.type || "image/jpeg";
        const b64 = buffer.toString("base64");
        urls.push(`data:${mime};base64,${b64}`);
      }
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
