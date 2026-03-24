/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { SUBURBS, MUTARE_SUBURBS, formatCurrency } from "@/lib/utils";
import {
  PlusCircle, CheckCircle2, Loader2, ImagePlus, X, ChevronRight, ChevronLeft,
  Home, Wrench, Zap, UserCircle, Camera, BarChart2, Lock, TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STEPS = [
  { id: 1, label: "Property", icon: Home },
  { id: 2, label: "Construction", icon: Wrench },
  { id: 3, label: "Amenities", icon: Zap },
  { id: 4, label: "Contact", icon: UserCircle },
  { id: 5, label: "Photos", icon: Camera },
  { id: 6, label: "Price & Confirm", icon: BarChart2 },
];

const ALGORITHM_INFO = {
  HEDONIC: {
    name: "Hedonic Pricing Model",
    desc: "Regression-based model that assigns monetary values to individual property attributes. Ideal for standard properties.",
    color: "emerald",
  },
  COMPARABLE_SALES: {
    name: "Comparable Sales Analysis",
    desc: "Adjusts from suburb market comparables using percentage grids. Closest to how estate agents price properties.",
    color: "blue",
  },
  COST_APPROACH: {
    name: "Cost Approach",
    desc: "Estimates replacement construction cost + land value, then converts to rental yield. Best for newer properties.",
    color: "purple",
  },
};

const inputClass = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-zinc-600";
const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

type PredResult = {
  predictedPrice: number; minPrice: number; maxPrice: number;
  confidence: number; algorithm: string;
  factors: { label: string; impact: number; positive: boolean }[];
  steps: { step: string; value: number; note: string }[];
};

export default function ListPropertyPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<PredResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    // Step 1 — Property Details
    title: "", description: "", address: "", suburb: "",
    propertyType: "HOUSE", listingType: "WHOLE_HOUSE",
    bedrooms: "2", bathrooms: "1", squareMeters: "", yearBuilt: "",
    // Step 2 — Construction & Condition
    houseConstruction: "BRICK", roofType: "IRON_SHEETS",
    windowCondition: "GOOD", wallCondition: "GOOD", bathroomType: "SHOWER_ONLY",
    // Step 3 — Amenities
    hasWater: false, hasElectricity: false, hasRefuseCollection: false,
    hasSecurity: false, hasWifi: false, hasBorehole: false, hasDriveway: false,
    hasPool: false, hasGenerator: false, hasSolarPower: false,
    // Step 4 — Contact
    contactName: session?.user?.name ?? "", contactPhone: "",
    contactEmail: session?.user?.email ?? "", contactRole: "LANDLORD",
    // Step 6 — Algorithm
    algorithm: "HEDONIC",
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + imageFiles.length > 8) { setError("Maximum 8 images"); return; }
    setError("");
    const newFiles = [...imageFiles, ...files].slice(0, 8);
    setImageFiles(newFiles);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((p) => [...p, ev.target?.result as string].slice(0, 8));
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i: number) => {
    setImageFiles((f) => f.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const runPrediction = async () => {
    if (!form.suburb) { setError("Please select a suburb first."); return; }
    setPredicting(true); setError("");
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (data.predictedPrice) setPrediction(data);
      else setError("Prediction failed. Please try again.");
    } catch {
      setError("Could not reach prediction service.");
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.suburb) { setError("Please select a suburb."); return; }
    if (!form.contactName || !form.contactPhone) { setError("Contact name and phone are required."); return; }
    setError(""); setLoading(true);

    const coords = MUTARE_SUBURBS[form.suburb] ?? { lat: -18.9558, lng: 32.6504 };

    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) { const d = await uploadRes.json(); imageUrls = d.urls; }
      }

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          latitude: coords.lat, longitude: coords.lng,
          images: imageUrls, userId: session?.user?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const detail = errData?.detail ? ` (${errData.detail})` : "";
        throw new Error(`Server error ${res.status}${detail}`);
      }
      setSuccess(true);
      setTimeout(() => router.push("/properties"), 2500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to list property: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!form.suburb || !form.address)) { setError("Please fill suburb and address."); return; }
    if (step === 5) { runPrediction(); }
    setError("");
    setStep((s) => Math.min(s + 1, 6));
  };
  const prevStep = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  if (sessionStatus === "loading") return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>;

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
          <PlusCircle className="w-8 h-8 text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Sign In Required</h2>
        <p className="text-zinc-500 mb-4">You need to be signed in to list a property.</p>
        <Link href="/login" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
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
        <p className="text-zinc-500">Your property has been priced and submitted. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">List Your Property</h1>
        </div>
        <p className="text-zinc-500 text-sm mt-1 ml-12">The system automatically sets a fair market price using algorithmic pricing — landlords cannot override it.</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400" : done ? "bg-zinc-800/60 border border-zinc-700/30 text-zinc-400" : "bg-zinc-900/40 border border-zinc-800/40 text-zinc-600"}`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Icon className="w-3.5 h-3.5" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className="w-3 h-px bg-zinc-800" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-5">

            {/* â”€â”€ Step 1: Property Details â”€â”€ */}
            {step === 1 && (
              <>
                <h2 className="font-semibold text-zinc-100">Property Details</h2>
                <div>
                  <label className={labelClass}>Listing Title *</label>
                  <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. 3-Bedroom Brick House in Chikanga" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="Describe the property…" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Suburb *</label>
                    <select value={form.suburb} onChange={(e) => update("suburb", e.target.value)} className={inputClass}>
                      <option value="">Select suburb…</option>
                      {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Street Address *</label>
                    <input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Bvumba Road" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Listing Type</label>
                    <select value={form.listingType} onChange={(e) => {
                      const lt = e.target.value;
                      setForm((f) => ({ ...f, listingType: lt, bedrooms: lt === "ROOM" ? "1" : f.bedrooms }));
                    }} className={inputClass}>
                      <option value="WHOLE_HOUSE">Whole Property</option>
                      <option value="ROOM">Single Room</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Property Type</label>
                    <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
                      {[["HOUSE","House"],["FLAT","Flat / Apartment"],["ROOM","Room"],["TOWNHOUSE","Townhouse"],["COTTAGE","Cottage"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                {form.listingType === "ROOM" && (
                  <p className="text-xs text-blue-400/80 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                    Single room listings are counted as 1 bedroom — the bedroom count field is not applicable.
                  </p>
                )}
                <div className={`grid gap-4 ${form.listingType === "ROOM" ? "grid-cols-2" : "grid-cols-3"}`}>
                  {form.listingType !== "ROOM" && (
                    <div>
                      <label className={labelClass}>Bedrooms</label>
                      <select value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputClass}>
                        {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Bathrooms</label>
                    <select value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputClass}>
                      {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Floor Area (m²)</label>
                    <input type="number" value={form.squareMeters} onChange={(e) => update("squareMeters", e.target.value)} placeholder="e.g. 80" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Year Built</label>
                  <input type="number" value={form.yearBuilt} onChange={(e) => update("yearBuilt", e.target.value)} placeholder="e.g. 2005" min={1900} max={2026} className={inputClass} />
                </div>
              </>
            )}

            {/* â”€â”€ Step 2: Construction & Condition â”€â”€ */}
            {step === 2 && (
              <>
                <h2 className="font-semibold text-zinc-100">Construction &amp; Condition</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Wall Construction</label>
                    <select value={form.houseConstruction} onChange={(e) => update("houseConstruction", e.target.value)} className={inputClass}>
                      {[["BRICK","Brick"],["STONE","Stone"],["MIXED","Mixed (brick + other)"],["WOOD","Wood / Timber"],["METAL","Metal / Zinc"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Roof Type</label>
                    <select value={form.roofType} onChange={(e) => update("roofType", e.target.value)} className={inputClass}>
                      {[["TILES","Tiles"],["CONCRETE","Concrete slab"],["ASBESTOS","Asbestos sheets"],["IRON_SHEETS","Iron / Zinc sheets"],["THATCH","Thatch"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Wall Condition</label>
                    <select value={form.wallCondition} onChange={(e) => update("wallCondition", e.target.value)} className={inputClass}>
                      {[["EXCELLENT","Excellent — newly plastered, no cracks"],["GOOD","Good — minor marks only"],["FAIR","Fair — some cracks / peeling"],["POOR","Poor — major repairs needed"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Window Condition</label>
                    <select value={form.windowCondition} onChange={(e) => update("windowCondition", e.target.value)} className={inputClass}>
                      {[["EXCELLENT","Excellent — all intact, seals good"],["GOOD","Good — minor wear"],["FAIR","Fair — some broken / stiff"],["POOR","Poor — multiple broken"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Bathroom Fittings</label>
                  <select value={form.bathroomType} onChange={(e) => update("bathroomType", e.target.value)} className={inputClass}>
                    {[["SHOWER_AND_TUB","Shower & Bathtub"],["SHOWER_ONLY","Shower only"],["TUB_ONLY","Bathtub only"],["NONE","No bath/shower (bucket wash)"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* â”€â”€ Step 3: Amenities â”€â”€ */}
            {step === 3 && (
              <>
                <h2 className="font-semibold text-zinc-100">Utilities &amp; Amenities</h2>
                <p className="text-xs text-zinc-500">Select everything that the property has. These affect the algorithmic price calculation.</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "hasElectricity", label: "⚡ Mains Electricity" },
                    { key: "hasWater", label: "💧 Running Water (ZINWA)" },
                    { key: "hasSecurity", label: "🔒 Security / Gated" },
                    { key: "hasRefuseCollection", label: "🗑️ Refuse Collection" },
                    { key: "hasWifi", label: "📶 WiFi / Internet" },
                    { key: "hasBorehole", label: "🪣 Borehole Water" },
                    { key: "hasDriveway", label: "🚗 Driveway / Parking" },
                    { key: "hasPool", label: "🏊 Swimming Pool" },
                    { key: "hasGenerator", label: "🔋 Generator Backup" },
                    { key: "hasSolarPower", label: "☀️ Solar Power" },
                  ].map(({ key, label }) => {
                    const val = form[key as keyof typeof form] as boolean;
                    return (
                      <button key={key} type="button" onClick={() => update(key, !val)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${val ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:border-zinc-600"}`}>
                        {label}
                        {val && <span className="float-right text-emerald-400">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* â”€â”€ Step 4: Contact â”€â”€ */}
            {step === 4 && (
              <>
                <h2 className="font-semibold text-zinc-100">Contact Information</h2>
                <div>
                  <label className={labelClass}>I am listing as *</label>
                  <select value={form.contactRole} onChange={(e) => update("contactRole", e.target.value)} className={inputClass}>
                    {[["LANDLORD","Landlord / Property Owner"],["ESTATE_AGENT","Estate Agent / Realtor"],["PROPERTY_MANAGER","Property Manager"],["CARETAKER","Caretaker on behalf of owner"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Contact Name *</label>
                  <input value={form.contactName} onChange={(e) => update("contactName", e.target.value)} placeholder="Full name" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input type="tel" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="+263 77 123 4567" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email (optional)</label>
                    <input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} placeholder="you@example.com" className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {/* â”€â”€ Step 5: Photos â”€â”€ */}
            {step === 5 && (
              <>
                <h2 className="font-semibold text-zinc-100">Property Photos</h2>
                <p className="text-xs text-zinc-500">Upload up to 8 photos. Good photos attract better tenants.</p>
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700/50 group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 8 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-zinc-700/50 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 transition-colors">
                      <ImagePlus className="w-5 h-5 text-zinc-600" />
                      <span className="text-[10px] text-zinc-600">Add photo</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </>
            )}

            {/* â”€â”€ Step 6: Algorithm + Price â”€â”€ */}
            {step === 6 && (
              <>
                <h2 className="font-semibold text-zinc-100">Choose Pricing Algorithm &amp; Confirm</h2>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">The monthly rent is set automatically by the algorithm below. This ensures fair, standardised pricing across all listings — you cannot override it.</p>
                </div>

                {/* Algorithm picker */}
                <div className="space-y-2">
                  {(["HEDONIC", "COMPARABLE_SALES", "COST_APPROACH"] as const).map((algo) => {
                    const info = ALGORITHM_INFO[algo];
                    const active = form.algorithm === algo;
                    return (
                      <button key={algo} type="button"
                        onClick={() => { update("algorithm", algo); setPrediction(null); }}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${active ? "bg-emerald-500/10 border-emerald-500/40" : "bg-zinc-800/40 border-zinc-700/40 hover:border-zinc-600"}`}>
                        <p className={`text-sm font-semibold ${active ? "text-emerald-300" : "text-zinc-300"}`}>{info.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{info.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Predict / result */}
                {!prediction ? (
                  <button type="button" onClick={runPrediction} disabled={predicting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium hover:bg-emerald-500/30 transition-all disabled:opacity-60">
                    {predicting ? <><Loader2 className="w-4 h-4 animate-spin" />Running {ALGORITHM_INFO[form.algorithm as keyof typeof ALGORITHM_INFO]?.name}…</> : <><TrendingUp className="w-4 h-4" />Run Price Calculation</>}
                  </button>
                ) : (
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Predicted Monthly Rent</span>
                      <span className="text-2xl font-bold text-emerald-400">{formatCurrency(prediction.predictedPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Range: {formatCurrency(prediction.minPrice)} â€“ {formatCurrency(prediction.maxPrice)}</span>
                      <span className="text-emerald-400/80">Confidence: {prediction.confidence}%</span>
                    </div>
                    {/* Factor breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-700/40">
                      <p className="text-xs font-medium text-zinc-400 mb-2">Price Breakdown</p>
                      {prediction.factors.slice(0, 8).map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">{f.label}</span>
                          <span className={f.positive ? "text-emerald-400" : "text-red-400"}>{f.impact >= 0 ? "+" : ""}{formatCurrency(f.impact)}</span>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setPrediction(null)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-1">
                      ↺ Recalculate
                    </button>
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button type="button" onClick={prevStep} disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700/50 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 text-sm font-medium transition-all disabled:opacity-40 disabled:pointer-events-none">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 6 ? (
          <button type="button" onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20">
            {step === 5 ? "Calculate Price" : "Continue"} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading || !prediction}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:pointer-events-none">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><CheckCircle2 className="w-4 h-4" />Submit Listing</>}
          </button>
        )}
      </div>
      {step === 6 && !prediction && <p className="text-xs text-zinc-600 text-center mt-2">Run price calculation first to submit</p>}
    </div>
  );
}
