"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropertyCard from "@/components/PropertyCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { SUBURBS } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const [filters, setFilters] = useState({
    suburb: searchParams.get("suburb") ?? "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    propertyType: "",
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.suburb) params.set("suburb", filters.suburb);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
    if (filters.propertyType) params.set("propertyType", filters.propertyType);
    params.set("status", "AVAILABLE");

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties ?? []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const clearFilters = () => {
    setFilters({ suburb: "", minPrice: "", maxPrice: "", bedrooms: "", propertyType: "" });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const selectClass = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50";
  const inputClass = selectClass;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Available Rentals</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {loading ? "Loading..." : `${properties.length} properties found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700/50 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 text-sm font-medium transition-all"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 mb-6 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Suburb</label>
              <select title="Filter by suburb" value={filters.suburb}
                onChange={(e) => setFilters((f) => ({ ...f, suburb: e.target.value }))} className={selectClass}>
                <option value="">All suburbs</option>
                {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Min Price ($)</label>
              <input type="number" value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))} placeholder="0" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Max Price ($)</label>
              <input type="number" value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))} placeholder="Any" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Bedrooms</label>
              <select title="Filter by bedrooms" value={filters.bedrooms}
                onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))} className={selectClass}>
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Type</label>
              <select title="Filter by property type" value={filters.propertyType}
                onChange={(e) => setFilters((f) => ({ ...f, propertyType: e.target.value }))} className={selectClass}>
                <option value="">All types</option>
                {["HOUSE", "FLAT", "ROOM", "TOWNHOUSE", "COTTAGE"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-zinc-500 text-sm">Loading properties...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 text-lg font-medium">No properties found</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {properties.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PropertyCard {...p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
