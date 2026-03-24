"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { Search, SlidersHorizontal, X, Loader2, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { SUBURBS, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Property {
  id: string; title: string; suburb: string; price: number;
  bedrooms: number; bathrooms: number; propertyType: string; listingType: string;
  status: string; hasWater: boolean; hasElectricity: boolean; hasSecurity: boolean;
  hasWifi: boolean; squareMeters: number | null; images: string[];
  houseConstruction: string; algorithm: string;
}

const BUDGET_PRESETS = [
  { label: "Under $100", max: 100 },
  { label: "$100â€“$200", min: 100, max: 200 },
  { label: "$200â€“$350", min: 200, max: 350 },
  { label: "$350â€“$500", min: 350, max: 500 },
  { label: "$500+", min: 500 },
];

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
      <PropertiesPageInner />
    </Suspense>
  );
}

function PropertiesPageInner() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    suburb: searchParams.get("suburb") ?? "",
    minPrice: "", maxPrice: "",
    bedrooms: "", propertyType: "", listingType: "",
    hasWifi: false, hasPool: false, hasBorehole: false,
    houseConstruction: "",
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.suburb) params.set("suburb", filters.suburb);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.propertyType) params.set("propertyType", filters.propertyType);
    if (filters.listingType) params.set("listingType", filters.listingType);
    if (filters.hasWifi) params.set("hasWifi", "true");
    if (filters.hasPool) params.set("hasPool", "true");
    if (filters.hasBorehole) params.set("hasBorehole", "true");
    if (filters.houseConstruction) params.set("houseConstruction", filters.houseConstruction);
    params.set("status", "AVAILABLE");

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`);
      setProperties(data.properties ?? []);
    } catch (e) {
      console.error("fetchProperties error:", e);
      setProperties([]);
    }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const clearFilters = () => setFilters({
    suburb: "", minPrice: "", maxPrice: "", bedrooms: "",
    propertyType: "", listingType: "", hasWifi: false, hasPool: false,
    hasBorehole: false, houseConstruction: "",
  });

  const applyBudgetPreset = (min?: number, max?: number) => {
    setFilters((f) => ({ ...f, minPrice: min ? String(min) : "", maxPrice: max ? String(max) : "" }));
  };

  const hasActiveFilters = Object.entries(filters).some(([, v]) => v !== "" && v !== false);

  const sc = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Available Rentals</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {loading ? "Loading..." : `${properties.length} propert${properties.length !== 1 ? "ies" : "y"} found`}
          </p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700/50 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 text-sm font-medium transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 mb-6 backdrop-blur-sm space-y-4">

            {/* Budget presets */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Budget Presets</label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((p) => {
                  const active = filters.minPrice === String(p.min ?? "") && filters.maxPrice === String(p.max ?? "");
                  return (
                    <button key={p.label} onClick={() => applyBudgetPreset(p.min, p.max)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${active ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:border-zinc-600"}`}>
                      {p.label}
                    </button>
                  );
                })}
                <button onClick={() => setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }))}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-zinc-800/60 text-zinc-600 hover:text-zinc-400 transition-all">
                  Custom â†“
                </button>
              </div>
            </div>

            {/* Main filters row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Suburb</label>
                <select value={filters.suburb} onChange={(e) => setFilters((f) => ({ ...f, suburb: e.target.value }))} className={sc}>
                  <option value="">All suburbs</option>
                  {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Min Price ($)</label>
                <input type="number" value={filters.minPrice} onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} placeholder="0" className={sc} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Max Price ($)</label>
                <input type="number" value={filters.maxPrice} onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} placeholder="Any" className={sc} />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Min Bedrooms</label>
                <select value={filters.bedrooms} onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))} className={sc}>
                  <option value="">Any</option>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Property Type</label>
                <select value={filters.propertyType} onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))} className={sc}>
                  <option value="">All types</option>
                  {[["HOUSE","House"],["FLAT","Flat"],["ROOM","Room"],["TOWNHOUSE","Townhouse"],["COTTAGE","Cottage"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Listing Type</label>
                <select value={filters.listingType} onChange={(e) => setFilters((f) => ({ ...f, listingType: e.target.value }))} className={sc}>
                  <option value="">Any</option>
                  <option value="WHOLE_HOUSE">Whole Property</option>
                  <option value="ROOM">Single Room</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Construction</label>
                <select value={filters.houseConstruction} onChange={(e) => setFilters((f) => ({ ...f, houseConstruction: e.target.value }))} className={sc}>
                  <option value="">Any</option>
                  {[["BRICK","Brick"],["STONE","Stone"],["MIXED","Mixed"],["WOOD","Wood"],["METAL","Metal"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-2">
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  More filters
                </button>
              </div>
            </div>

            {/* Advanced amenity filters */}
            {showAdvanced && (
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { key: "hasWifi", label: "ðŸ“¶ WiFi" },
                  { key: "hasPool", label: "ðŸŠ Pool" },
                  { key: "hasBorehole", label: "ðŸª£ Borehole" },
                ].map(({ key, label }) => {
                  const val = filters[key as keyof typeof filters] as boolean;
                  return (
                    <button key={key} onClick={() => setFilters((f) => ({ ...f, [key]: !val }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${val ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:border-zinc-600"}`}>
                      {label} {val && "âœ“"}
                    </button>
                  );
                })}
              </div>
            )}

            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-medium">No properties found</p>
          <p className="text-zinc-600 text-sm mt-1 mb-6">
            {hasActiveFilters ? "Try adjusting your filters â€” or submit a requisition." : "No listings yet â€” check back soon."}
          </p>
          {hasActiveFilters && (
            <Link href={`/requisitions?${new URLSearchParams({ suburb: filters.suburb, propertyType: filters.propertyType, maxBudget: filters.maxPrice, minBedrooms: filters.bedrooms }).toString()}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-all">
              <Bell className="w-4 h-4" />
              Submit a Requisition â€” get notified when a match is listed
            </Link>
          )}
        </div>
      ) : (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <PropertyCard {...p} />
              </motion.div>
            ))}
          </motion.div>

          {/* Requisition CTA */}
          <div className="mt-12 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 text-center">
            <Bell className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <p className="text-zinc-300 font-medium mb-1">Not finding what you want?</p>
            <p className="text-zinc-500 text-sm mb-4">Submit a requisition with your requirements. If a matching property is listed, we will notify you immediately.</p>
            <Link href="/requisitions" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-all">
              <Bell className="w-4 h-4" /> Submit Property Requisition
            </Link>
          </div>
        </>
      )}
    </div>
  );
}


interface Property {
  id: string;
  title: string;
  suburb: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  status: string;
  hasWater: boolean;
  hasElectricity: boolean;
  hasSecurity: boolean;
  squareMeters: number | null;
  images: string[];
}

