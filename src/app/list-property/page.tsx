"use client";

import { useState, useRef } from "react";
import { SUBURBS, MUTARE_SUBURBS } from "@/lib/utils";
import { PlusCircle, CheckCircle2, Loader2, ImagePlus, X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ListPropertyPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    suburb: "",
    price: "",
    bedrooms: "2",
    bathrooms: "1",
    squareMeters: "",
    propertyType: "HOUSE",
    hasWater: false,
    hasElectricity: false,
    hasRefuseCollection: false,
    hasSecurity: false,
    yearBuilt: "",
    contactName: session?.user?.name ?? "",
    contactPhone: "",
    contactEmail: session?.user?.email ?? "",
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setError("");
    const newFiles = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(newFiles);

    // Generate previews
    const newPreviews: string[] = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((f) => f.filter((_, i) => i !== index));
    setImagePreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suburb) { setError("Please select a suburb."); return; }
    setError("");
    setLoading(true);

    const coords = MUTARE_SUBURBS[form.suburb] ?? { lat: -18.9558, lng: 32.6504 };

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrls = uploadData.urls;
        }
        setUploadingImages(false);
      }

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: coords.lat,
          longitude: coords.lng,
          images: imageUrls,
          userId: session?.user?.id,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setSuccess(true);
      setTimeout(() => router.push("/properties"), 2500);
    } catch {
      setError("Failed to list property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-zinc-600";
  const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

  // Must be signed in to list
  if (sessionStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
          <PlusCircle className="w-8 h-8 text-zinc-600O" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Sign In Required</h2>
        <p className="text-zinc-500 mb-4">You need to be signed in to list a property.</p>
        <Link href="/login" className="inline-flex	items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Property Listed!</h2>
        <p className="text-zinc-500">Your property has been submitted. Redirecting to listings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">List Your Property</h1>
        </div>
        <p className="text-zinc-500 mt-1 ml-12">Fill in the details and upload photos to list your rental.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-6">
        {/* Property Info */}
        <fieldset>
          <legend className="font-semibold text-zinc-100 mb-4">Property Details</legend>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Listing Title *</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} required
                placeholder="e.g. Spacious 3-Bedroom House in Chikanga" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
                placeholder="Describe the property…" className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Suburb *</label>
                <select title="Select suburb" value={form.suburb} onChange={(e) => update("suburb", e.target.value)} required className={inputClass}>
                  <option value="">Select…</option>
                  {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Street Address *</label>
                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} required
                  placeholder="123 Main Road" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>Type</label>
                <select title="Property type" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
                  {["HOUSE", "FLAT", "ROOM", "TOWNHOUSE", "COTTAGE"].map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Beds</label>
                <select title="Number of bedrooms" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputClass}>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Baths</label>
                <select title="Number of bathrooms" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputClass}>
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Size (m²)</label>
                <input type="number" value={form.squareMeters} onChange={(e) => update("squareMeters", e.target.value)}
                  placeholder="80" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Monthly Rent (USD) *</label>
                <input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required
                  placeholder="e.g. 300" min={1} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year Built</label>
                <input type="number" value={form.yearBuilt} onChange={(e) => update("yearBuilt", e.target.value)}
                  placeholder="e.g. 2005" className={inputClass} />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Image Upload */}
        <fieldset>
          <legend className="font-semibold text-zinc-100 mb-3">Property Images</legend>
          <p className="text-xs text-zinc-500 mb-3">Upload up to 5 photos of your property (JPG, PNG)</p>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700/50 group">
                <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {imagePreviews.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-zinc-700/50 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-5 h-5 text-zinc-600" />
                <span className="text-[10px] text-zinc-600">Add</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
        </fieldset>

        {/* Amenities */}
        <fieldset>
          <legend className="font-semibold text-zinc-100 mb-3">Amenities</legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "hasElectricity", label: "Electricity" },
              { key: "hasWater", label: "Running Water" },
              { key: "hasSecurity", label: "Security / Gated" },
              { key: "hasRefuseCollection", label: "Refuse Collection" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => update(key, e.target.checked)} className="accent-emerald-500 rounded" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset>
          <legend className="font-semibold text-zinc-100 mb-4">Contact Information</legend>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Your Name *</label>
              <input type="text" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} required
                placeholder="Full name" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone *</label>
                <input type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} required
                  placeholder="+263 77 XXX XXXX" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)}
                  placeholder="you@example.com" className={inputClass} />
              </div>
            </div>
          </div>
        </fieldset>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
        >
          {loading ? (
            <>{uploadingImages ? <Upload className="w-4 h-4 animate-bounce" /> : <Loader2 className="w-4 h-4 animate-spin" />} {uploadingImages ? "Uploading images…" : "Submitting…"}</>
          ) : (
            <><PlusCircle className="w-4 h-4" /> List Property</>
          )}
        </button>
      </form>
    </div>
  );
}
