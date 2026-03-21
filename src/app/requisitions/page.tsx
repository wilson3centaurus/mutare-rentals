"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUBURBS, formatCurrency } from "@/lib/utils";
import { Bell, CheckCircle2, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const inputClass = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-zinc-600";
const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

type ReqResult = {
  requisition: { id: string };
  estimatedMin: number;
  estimatedMax: number;
};

export default function RequisitionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>}>
      <RequisitionsInner />
    </Suspense>
  );
}

function RequisitionsInner() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReqResult | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    suburb: searchParams.get("suburb") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
    listingType: "",
    minBedrooms: searchParams.get("minBedrooms") ?? "1",
    maxBedrooms: "3",
    maxBudget: searchParams.get("maxBudget") ?? "",
    hasWater: false, hasElectricity: false, hasSecurity: false, hasWifi: false,
    notes: "",
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-blue-400" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">Requisition Submitted!</h2>
        <p className="text-zinc-500 mb-6">You will be notified as soon as a matching property is listed on the system.</p>

        {/* Price estimate */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-300">Estimated Market Price Range</span>
          </div>
          <p className="text-zinc-500 text-xs mb-2">Based on your specs and current Mutare market data:</p>
          <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
            <span className="text-zinc-400 text-sm">Monthly Rent</span>
            <span className="text-emerald-400 font-bold">
              {formatCurrency(result.estimatedMin)} – {formatCurrency(result.estimatedMax)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/properties" className="px-5 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-all">
            View Listings
          </Link>
          <button onClick={() => setResult(null)} className="px-5 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-all">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Property Requisition</h1>
        </div>
        <p className="text-zinc-500 text-sm mt-1 ml-12">
          Can&apos;t find the property you want? Submit a requisition. We&apos;ll notify you the moment a matching listing appears — and show you a price estimate right now.
        </p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-2 mb-6">
        <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">
          Your requisition is stored securely. When a landlord or agent lists a property matching your criteria, the system will flag the match and alert you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-zinc-100">What property are you looking for?</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Preferred Suburb</label>
            <select value={form.suburb} onChange={(e) => update("suburb", e.target.value)} className={inputClass}>
              <option value="">Any suburb</option>
              {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
              <option value="">Any type</option>
              {[["HOUSE","House"],["FLAT","Flat / Apartment"],["ROOM","Room"],["TOWNHOUSE","Townhouse"],["COTTAGE","Cottage"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Listing Format</label>
          <select value={form.listingType} onChange={(e) => update("listingType", e.target.value)} className={inputClass}>
            <option value="">Doesn&apos;t matter</option>
            <option value="WHOLE_HOUSE">Whole property only</option>
            <option value="ROOM">Single room only</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Min Bedrooms</label>
            <select value={form.minBedrooms} onChange={(e) => update("minBedrooms", e.target.value)} className={inputClass}>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Max Bedrooms</label>
            <select value={form.maxBedrooms} onChange={(e) => update("maxBedrooms", e.target.value)} className={inputClass}>
              {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Maximum Monthly Budget (USD)</label>
          <input type="number" value={form.maxBudget} onChange={(e) => update("maxBudget", e.target.value)}
            placeholder="e.g. 300" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>High-Priority Requirements <span className="text-zinc-600">(select all that must be present)</span></label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { key: "hasElectricity", label: "⚡ Electricity" },
              { key: "hasWater", label: "💧 Running Water" },
              { key: "hasSecurity", label: "🔒 Security" },
              { key: "hasWifi", label: "📶 WiFi" },
            ].map(({ key, label }) => {
              const val = form[key as keyof typeof form] as boolean;
              return (
                <button key={key} type="button" onClick={() => update(key, !val)}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${val ? "bg-blue-500/15 border-blue-500/40 text-blue-300" : "bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:border-zinc-600"}`}>
                  {label} {val && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Additional Notes <span className="text-zinc-600">(optional)</span></label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3}
            placeholder="e.g. Must be close to Chikanga primary school. Pet-friendly preferred. Available from June 2026."
            className={inputClass} />
        </div>

        {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Bell className="w-4 h-4" />Submit Requisition &amp; Get Price Estimate</>}
        </button>

        <p className="text-xs text-zinc-600 text-center">
          Already listed?{" "}
          <Link href="/properties" className="text-blue-400 hover:underline">Browse available properties →</Link>
        </p>
      </form>
    </div>
  );
}
