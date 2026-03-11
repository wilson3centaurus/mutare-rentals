"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Zap, Droplets, Shield, ArrowUpRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PropertyCardProps {
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
  squareMeters?: number | null;
  images?: string[];
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  RENTED: "bg-red-500/20 text-red-400 border border-red-500/30",
  PENDING: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  HOUSE: "House",
  FLAT: "Flat",
  ROOM: "Room",
  TOWNHOUSE: "Townhouse",
  COTTAGE: "Cottage",
};

export default function PropertyCard({
  id,
  title,
  suburb,
  price,
  bedrooms,
  bathrooms,
  propertyType,
  status,
  hasWater,
  hasElectricity,
  hasSecurity,
  squareMeters,
  images,
}: PropertyCardProps) {
  const thumbnail = images?.[0] ?? null;

  return (
    <Link href={`/properties/${id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group bg-zinc-900/60 rounded-2xl border border-zinc-800/60 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
      >
        {/* Image */}
        <div className="relative h-44 bg-zinc-800/50 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800/80 to-zinc-900/80">
              <div className="w-16 h-16 rounded-2xl bg-zinc-700/30 border border-zinc-700/50 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-zinc-600" />
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm", STATUS_COLORS[status])}>
              {status}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900/70 text-zinc-300 border border-zinc-700/50 backdrop-blur-sm">
              {TYPE_LABELS[propertyType] ?? propertyType}
            </span>
          </div>
          {/* Hover arrow */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="font-semibold text-zinc-100 truncate group-hover:text-emerald-400 transition-colors">{title}</p>
          <div className="flex items-center gap-1 mt-1 text-zinc-500 text-sm">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-zinc-600" />
            <span>{suburb}, Mutare</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 mt-3 text-zinc-400 text-sm">
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-zinc-500" /> {bedrooms} Bed
            </span>
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4 text-zinc-500" /> {bathrooms} Bath
            </span>
            {squareMeters && (
              <span className="text-zinc-500">{squareMeters}m²</span>
            )}
          </div>

          {/* Amenity Badges */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {hasElectricity && (
              <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> Power
              </span>
            )}
            {hasWater && (
              <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                <Droplets className="w-3 h-3" /> Water
              </span>
            )}
            {hasSecurity && (
              <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" /> Security
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(price)}
              </p>
              <p className="text-xs text-zinc-600">per month</p>
            </div>
            <span className="text-sm text-zinc-500 font-medium group-hover:text-emerald-400 transition-colors">
              Details →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
