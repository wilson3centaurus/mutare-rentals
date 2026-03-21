"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUBURBS, formatCurrency } from "@/lib/utils";
import {
  BarChart2, TrendingUp, Building2, CheckCircle2, XCircle,
  ArrowRight, Loader2, Info, BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface PredictionFactor {
  label: string;
  impact: number;
  positive: boolean;
}

interface PredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  algorithm: string;
  steps: string[];
  factors: PredictionFactor[];
}

const ALGORITHMS = [
  {
    id: "HEDONIC",
    name: "Hedonic Pricing",
    short: "Linear regression on property attributes",
    description: "Adds a monetary value to each attribute (bedrooms, bathrooms, size, construction, amenities). Best for standard residential properties.",
    icon: BarChart2,
    color: "emerald",
  },
  {
    id: "COMPARABLE_SALES",
    name: "Comparable Sales",
    short: "Multiplicative adjustments from suburb median",
    description: "Starts from a suburb market median and applies percentage adjustments for each difference. Closest to how estate agents work.",
    icon: TrendingUp,
    color: "blue",
  },
  {
    id: "COST_APPROACH",
    name: "Cost Approach",
    short: "Construction cost + land value → rental yield",
    description: "Computes rebuilding cost, depreciates for age, adds land value then converts to monthly rent via an 8.5% yield. Best for new builds where m² is known.",
    icon: Building2,
    color: "purple",
  },
];

const colorMap: Record<string, Record<string, string>> = {
  emerald: {
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/40",
    text: "text-emerald-400",
    bar: "from-emerald-500 to-emerald-400",
    badge: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/40",
    text: "text-blue-400",
    bar: "from-blue-500 to-blue-400",
    badge: "bg-blue-500/10 border border-blue-500/20 text-blue-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    ring: "ring-purple-500/40",
    text: "text-purple-400",
    bar: "from-purple-500 to-purple-400",
    badge: "bg-purple-500/10 border border-purple-500/20 text-purple-400",
  },
};

export default function PredictPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    }>
      <PredictPageInner />
    </Suspense>
  );
}

function PredictPageInner() {
  const searchParams = useSearchParams();

  const [algorithm, setAlgorithm] = useState("HEDONIC");
  const [form, setForm] = useState({
    suburb: searchParams.get("suburb") ?? "",
    bedrooms: searchParams.get("bedrooms") ?? "2",
    bathrooms: "1",
    squareMeters: "",
    propertyType: "HOUSE",
    listingType: "WHOLE_HOUSE",
    houseConstruction: "BRICK",
    roofType: "IRON_SHEETS",
    wallCondition: "GOOD",
    windowCondition: "GOOD",
    yearBuilt: "",
    hasWater: true,
    hasElectricity: true,
    hasRefuseCollection: false,
    hasSecurity: false,
    hasWifi: false,
    hasBorehole: false,
    hasDriveway: false,
    hasPool: false,
    hasGenerator: false,
    hasSolarPower: false,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suburb) { setError("Please select a suburb."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, algorithm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Prediction failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit if params provided via URL
  useEffect(() => {
    if (searchParams.get("suburb") && searchParams.get("bedrooms")) {
      const t = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }, 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAlgo = ALGORITHMS.find((a) => a.id === algorithm)!;
  const c = colorMap[selectedAlgo.color];

  const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-zinc-600";
  const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Price Calculator</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Select an algorithm, enter property details, and see a transparent step-by-step price breakdown.
          </p>
        </div>
        <Link
          href="/algorithms"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 text-xs hover:bg-zinc-800 hover:text-zinc-200 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" /> Algorithm Docs
        </Link>
      </div>

      {/* Algorithm selector */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {ALGORITHMS.map((algo) => {
          const AlgoIcon = algo.icon;
          const ac = colorMap[algo.color];
          const isSelected = algorithm === algo.id;
          return (
            <button
              key={algo.id}
              onClick={() => { setAlgorithm(algo.id); setResult(null); }}
              className={`text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? `bg-zinc-800/80 border-zinc-600 ring-1 ${ac.ring}`
                  : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700/60 hover:bg-zinc-800/30"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${ac.bg}`}>
                <AlgoIcon className={`w-4 h-4 ${ac.text}`} />
              </div>
              <p className={`text-sm font-semibold mb-0.5 ${isSelected ? "text-zinc-100" : "text-zinc-300"}`}>
                {algo.name}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">{algo.short}</p>
            </button>
          );
        })}
      </div>

      {/* Selected algo hint */}
      <div className={`mb-6 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm ${c.badge}`}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="text-zinc-300 text-xs">{selectedAlgo.description}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
          <div>
            <label className={labelClass}>Suburb *</label>
            <select
              value={form.suburb}
              onChange={(e) => update("suburb", e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select suburb…</option>
              {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Property Type</label>
              <select title="Property Type" value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
                {["HOUSE", "FLAT", "ROOM", "TOWNHOUSE", "COTTAGE"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Listing Type</label>
              <select title="Listing Type" value={form.listingType} onChange={(e) => update("listingType", e.target.value)} className={inputClass}>
                <option value="WHOLE_HOUSE">Whole House</option>
                <option value="ROOM">Room Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <select title="Bedrooms" value={form.bedrooms} onChange={(e) => update("bedrooms", e.target.value)} className={inputClass}>
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <select title="Bathrooms" value={form.bathrooms} onChange={(e) => update("bathrooms", e.target.value)} className={inputClass}>
                {[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Size (m²)</label>
              <input
                type="number" value={form.squareMeters}
                onChange={(e) => update("squareMeters", e.target.value)}
                placeholder="e.g. 80" className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Year Built</label>
              <input
                type="number" value={form.yearBuilt}
                onChange={(e) => update("yearBuilt", e.target.value)}
                placeholder="e.g. 2005" min={1900} max={new Date().getFullYear()}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Construction</label>
              <select title="Construction" value={form.houseConstruction} onChange={(e) => update("houseConstruction", e.target.value)} className={inputClass}>
                <option value="BRICK">Brick</option>
                <option value="STONE">Stone</option>
                <option value="MIXED">Mixed</option>
                <option value="WOOD">Wood</option>
                <option value="METAL">Metal</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Roof Type</label>
              <select title="Roof Type" value={form.roofType} onChange={(e) => update("roofType", e.target.value)} className={inputClass}>
                <option value="TILES">Tiles</option>
                <option value="ASBESTOS">Asbestos</option>
                <option value="IRON_SHEETS">Iron Sheets</option>
                <option value="THATCH">Thatch</option>
                <option value="CONCRETE">Concrete</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Wall Condition</label>
              <select title="Wall Condition" value={form.wallCondition} onChange={(e) => update("wallCondition", e.target.value)} className={inputClass}>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Window Condition</label>
              <select title="Window Condition" value={form.windowCondition} onChange={(e) => update("windowCondition", e.target.value)} className={inputClass}>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">Amenities</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                { key: "hasElectricity", label: "Electricity" },
                { key: "hasWater", label: "Running Water" },
                { key: "hasRefuseCollection", label: "Refuse Collection" },
                { key: "hasSecurity", label: "Security" },
                { key: "hasWifi", label: "Wi-Fi" },
                { key: "hasBorehole", label: "Borehole" },
                { key: "hasDriveway", label: "Driveway" },
                { key: "hasPool", label: "Swimming Pool" },
                { key: "hasGenerator", label: "Generator" },
                { key: "hasSolarPower", label: "Solar / Inverter" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => update(key, e.target.checked)}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Calculating…</>
            ) : (
              <><selectedAlgo.icon className="w-4 h-4" /> Run {selectedAlgo.name} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* ── Result area ── */}
        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[520px] gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${c.bg}`}>
                  <selectedAlgo.icon className={`w-8 h-8 ${c.text} animate-pulse`} />
                </div>
                <p className="text-zinc-300 font-semibold">Running {selectedAlgo.name}…</p>
                <p className="text-zinc-600 text-sm text-center max-w-40">Computing step-by-step price breakdown</p>
                <div className="w-48 bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
                    animate={{ width: ["0%", "90%"] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {/* Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.badge}`}>
                  <selectedAlgo.icon className="w-3.5 h-3.5" />
                  {selectedAlgo.name}
                </div>

                {/* Main price */}
                <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
                  <p className="text-xs text-zinc-500 mb-1">Estimated Monthly Rent</p>
                  <p className="text-4xl font-bold text-zinc-100">{formatCurrency(result.predictedPrice)}</p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Range:{" "}
                    <span className="text-zinc-400">{formatCurrency(result.minPrice)}</span>
                    {" – "}
                    <span className="text-zinc-400">{formatCurrency(result.maxPrice)}</span>
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${c.bar} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${c.text}`}>{result.confidence}%</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">Model confidence</p>
                </div>

                {/* Step-by-step breakdown */}
                {result.steps && result.steps.length > 0 && (
                  <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-zinc-200 mb-3">Calculation Steps</p>
                    <div className="space-y-1.5">
                      {result.steps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-2 text-xs"
                        >
                          <span className={`font-mono text-[10px] w-5 text-right flex-shrink-0 mt-0.5 ${c.text} opacity-60`}>
                            {i + 1}.
                          </span>
                          <span className="text-zinc-400 leading-relaxed font-mono">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Factor contributions */}
                {result.factors && result.factors.length > 0 && (
                  <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
                    <p className="text-sm font-semibold text-zinc-200 mb-3">Factor Contributions</p>
                    <div className="space-y-2">
                      {result.factors.map((f, i) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.07 }}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2 text-zinc-400">
                            {f.positive
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                            }
                            <span className="text-xs">{f.label}</span>
                          </div>
                          <span className={`text-xs font-mono font-medium ${f.positive ? "text-emerald-400" : "text-red-400"}`}>
                            {f.positive ? "+" : ""}{formatCurrency(f.impact)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-zinc-700 text-center">
                  Prices computed by deterministic algorithm — not AI. Actual market prices may vary.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[520px] text-center border border-dashed border-zinc-800/50 rounded-2xl p-8"
              >
                <div className={`w-14 h-14 rounded-2xl ${c.bg} flex items-center justify-center mb-4`}>
                  <selectedAlgo.icon className={`w-7 h-7 ${c.text}`} />
                </div>
                <p className="text-zinc-400 font-medium text-sm">{selectedAlgo.name} ready</p>
                <p className="text-zinc-600 text-xs mt-1 max-w-48">
                  Fill in the property details and click Run to see a transparent step-by-step breakdown.
                </p>
                <Link
                  href="/algorithms"
                  className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                >
                  <BookOpen className="w-3 h-3" /> How does this algorithm work?
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
