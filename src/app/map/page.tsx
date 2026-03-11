"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MUTARE_CENTER } from "@/lib/utils";
import { SlidersHorizontal, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false });

interface Property {
  id: string;
  title: string;
  suburb: string;
  price: number;
  latitude: number;
  longitude: number;
  bedrooms: number;
  status: string;
}

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("AVAILABLE");

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      const params = new URLSearchParams({ status });
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties ?? []);
      setLoading(false);
    };
    fetchProps();
  }, [status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">GIS Map View</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {loading ? "Loading..." : `${properties.length} properties on map`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
          <select
            title="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="AVAILABLE">Available</option>
            <option value="RENTED">Rented</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { color: "bg-emerald-500", label: "Available" },
          { color: "bg-red-500", label: "Rented" },
          { color: "bg-amber-500", label: "Pending" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-sm text-zinc-400">
            <span className={`w-3 h-3 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
        <span className="text-xs text-zinc-600 ml-2">Price bubbles = monthly rent in USD</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-zinc-800/60"
      >
        {loading ? (
          <div className="h-[540px] bg-zinc-900/60 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-zinc-500 text-sm">Loading map data…</p>
          </div>
        ) : (
          <PropertyMap
            properties={properties}
            center={MUTARE_CENTER}
            zoom={13}
            height="540px"
          />
        )}
      </motion.div>

      <p className="text-xs text-zinc-600 mt-3 text-center">
        Map data © OpenStreetMap contributors · Click any marker to see property details
      </p>
    </div>
  );
}
