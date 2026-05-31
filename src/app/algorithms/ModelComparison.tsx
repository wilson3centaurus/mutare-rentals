"use client";

import { useState } from "react";
import { SUBURBS, formatCurrency } from "@/lib/utils";
import { BarChart2, TrendingUp, Building2, Loader2, ArrowRight } from "lucide-react";

const ALGO_META = [
  { id: "HEDONIC",           label: "Hedonic Pricing",    color: "emerald", Icon: BarChart2,  desc: "Linear regression on attributes" },
  { id: "COMPARABLE_SALES", label: "Comparable Sales",   color: "blue",    Icon: TrendingUp, desc: "Adjustment grid from suburb median" },
  { id: "COST_APPROACH",    label: "Cost Approach",      color: "purple",  Icon: Building2,  desc: "Construction cost → rental yield" },
] as const;

const COLORS = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", bar: "bg-emerald-500" },
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    text: "text-blue-400",    bar: "bg-blue-500" },
  purple:  { bg: "bg-purple-500/10",  border: "border-purple-500/20",  text: "text-purple-400",  bar: "bg-purple-500" },
};

interface AlgoResult {
  predictedPrice: number; minPrice: number; maxPrice: number; confidence: number;
}

export default function ModelComparison() {
  const [suburb, setSuburb] = useState("Murambi");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("1");
  const [results, setResults] = useState<Record<string, AlgoResult> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const compare = async () => {
    setLoading(true); setResults(null); setError("");
    try {
      const body = {
        suburb, bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
        listingType: "WHOLE_HOUSE", propertyType: "HOUSE",
        hasElectricity: true, hasWater: true, hasSecurity: false,
        houseConstruction: "BRICK", roofType: "IRON_SHEETS", wallCondition: "GOOD",
      };
      const [r1, r2, r3] = await Promise.all(
        (["HEDONIC", "COMPARABLE_SALES", "COST_APPROACH"] as const).map((algo) =>
          fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...body, algorithm: algo }),
          }).then((r) => r.json())
        )
      ) as [AlgoResult, AlgoResult, AlgoResult];
      setResults({ HEDONIC: r1, COMPARABLE_SALES: r2, COST_APPROACH: r3 });
    } catch {
      setError("Comparison failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const prices = results ? Object.values(results).map((r) => r.predictedPrice) : [];
  const maxPrice = prices.length ? Math.max(...prices) : 1;
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const spread = maxPrice - minPrice;
  const winner = results
    ? Object.entries(results).sort((a, b) => b[1].confidence - a[1].confidence)[0][0]
    : null;

  const select = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50";

  return (
    <div id="compare" className="mt-8 bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div>
          <h2 className="font-bold text-zinc-100">Best Algorithm</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Run all three algorithms on the same property and compare outputs side-by-side to identify which model gives the most accurate and consistent estimate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Suburb</label>
          <select value={suburb} onChange={(e) => setSuburb(e.target.value)} className={select}>
            {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Bedrooms</label>
          <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={select}>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Bathrooms</label>
          <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={select}>
            {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={compare} disabled={loading}
            className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Running…</>
              : <><BarChart2 className="w-4 h-4" />Compare All 3</>}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {results && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALGO_META.map(({ id, label, color, Icon, desc }) => {
              const r = results[id];
              const c = COLORS[color];
              const barPct = maxPrice > 0 ? (r.predictedPrice / maxPrice) * 100 : 0;
              const isBest = id === winner;
              return (
                <div key={id} className={`${c.bg} border ${c.border} rounded-xl p-4 ${isBest ? "ring-1 ring-emerald-400/40" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                    <p className={`text-xs font-semibold ${c.text}`}>{label}</p>
                    {isBest && <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">Best</span>}
                  </div>
                  <p className="text-xs text-zinc-600 mb-3">{desc}</p>
                  <p className="text-2xl font-bold text-zinc-100">{formatCurrency(r.predictedPrice)}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatCurrency(r.minPrice)} – {formatCurrency(r.maxPrice)}</p>
                  <div className="mt-2 h-1.5 bg-zinc-800/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bar} opacity-70 transition-all duration-500`} style={{ width: `${barPct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-zinc-600">Confidence</span>
                    <span className={`text-xs font-semibold ${c.text}`}>{r.confidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4 text-sm text-zinc-400 space-y-1">
            <p>
              <span className="font-medium text-zinc-200">Model spread: </span>
              All three models agree within{" "}
              <span className="text-emerald-400 font-medium">{formatCurrency(spread)}</span>{" "}
              ({Math.round((spread / maxPrice) * 100)}% variance) for a {bedrooms}-bed house in{" "}
              <span className="text-zinc-200">{suburb}</span>.
            </p>
            <p className="text-xs text-zinc-500">
              The <span className="text-zinc-300">{ALGO_META.find((m) => m.id === winner)?.label}</span> has the highest confidence for this input and is recommended as the best model for this property profile.
            </p>
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-600 mt-2">
          <ArrowRight className="w-4 h-4" />
          Configure inputs above and click <strong className="text-zinc-400">Compare All 3</strong> to see results.
        </div>
      )}
    </div>
  );
}
