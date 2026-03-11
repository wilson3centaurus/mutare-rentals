"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Home, PlusCircle, Eye, MapPin, Bed, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Property {
  id: string;
  title: string;
  suburb: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
  createdAt: string;
  views: number;
  images: string[];
}

export default function MyListingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetch(`/api/properties?userId=${session.user.id}`)
      .then((r) => r.json())
      .then((d) => { setProperties(d.properties ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading your listings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Home className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">My Listings</h1>
            <p className="text-zinc-500 text-sm">{properties.length} properties listed</p>
          </div>
        </div>
        <Link
          href="/list-property"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium mb-1">No listings yet</p>
          <p className="text-zinc-600 text-sm mb-4">Start by creating your first property listing.</p>
          <Link
            href="/list-property"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/properties/${p.id}`}>
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 hover:border-emerald-500/30 transition-all flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center shrink-0 overflow-hidden">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{p.title}</p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.suburb}</span>
                      <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms} bed</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views} views</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(p.price)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400" :
                      p.status === "RENTED" ? "bg-red-500/20 text-red-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>{p.status}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
