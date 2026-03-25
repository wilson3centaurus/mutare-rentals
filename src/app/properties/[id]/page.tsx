import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Bed, Bath, Zap, Droplets, Shield, Trash2, Phone, Mail, ArrowLeft, Brain, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: property } = await supabase
    .from("Property")
    .select("*")
    .eq("id", id)
    .single();
  if (!property) notFound();

  // Build auto-fill predict URL with all property details
  const predictParams = new URLSearchParams({
    suburb: property.suburb,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    propertyType: property.propertyType,
    ...(property.squareMeters ? { squareMeters: String(property.squareMeters) } : {}),
    ...(property.yearBuilt ? { yearBuilt: String(property.yearBuilt) } : {}),
    hasWater: String(property.hasWater),
    hasElectricity: String(property.hasElectricity),
    hasSecurity: String(property.hasSecurity),
    hasRefuseCollection: String(property.hasRefuseCollection),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to listings
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left / Main */}
        <div className="md:col-span-2 space-y-6">
          {/* Image gallery */}
          <div className="relative bg-zinc-800/50 rounded-2xl overflow-hidden h-64 md:h-80 flex items-center justify-center border border-zinc-800/60">
            {property.images.length > 0 ? (
              <Image src={property.images[0]} alt={property.title} fill className="object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-zinc-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent" />
          </div>

          {/* Title & location */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-zinc-100">{property.title}</h1>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                property.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                property.status === "RENTED" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {property.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-zinc-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.suburb}, Mutare</span>
            </div>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-4 p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
            <div className="flex items-center gap-2 text-zinc-300">
              <Bed className="w-4 h-4 text-zinc-500" />
              <span className="font-medium">{property.bedrooms}</span> Bedrooms
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Bath className="w-4 h-4 text-zinc-500" />
              <span className="font-medium">{property.bathrooms}</span> Bathrooms
            </div>
            {property.squareMeters && (
              <div className="text-zinc-300">
                <span className="font-medium">{property.squareMeters}</span> m²
              </div>
            )}
            {property.yearBuilt && (
              <div className="text-zinc-300">
                Built <span className="font-medium">{property.yearBuilt}</span>
              </div>
            )}
            <div className="text-zinc-300">
              Type: <span className="font-medium">{property.propertyType}</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-semibold text-zinc-100 mb-2">About this property</h2>
              <p className="text-zinc-400 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          <div>
            <h2 className="font-semibold text-zinc-100 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.hasElectricity && (
                <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-full text-sm">
                  <Zap className="w-4 h-4" /> Electricity
                </span>
              )}
              {property.hasWater && (
                <span className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-sm">
                  <Droplets className="w-4 h-4" /> Running Water
                </span>
              )}
              {property.hasSecurity && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-sm">
                  <Shield className="w-4 h-4" /> Security
                </span>
              )}
              {property.hasRefuseCollection && (
                <span className="flex items-center gap-1.5 bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 px-3 py-1.5 rounded-full text-sm">
                  <Trash2 className="w-4 h-4" /> Refuse Collection
                </span>
              )}
              {property.amenities.map((a: string) => (
                <span key={a} className="bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 px-3 py-1.5 rounded-full text-sm">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sticky top-24">
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(property.price)}</p>
            <p className="text-zinc-500 text-sm">per month</p>

            <div className="border-t border-zinc-800/60 mt-4 pt-4 space-y-3">
              <h3 className="font-semibold text-zinc-100">Contact Landlord</h3>
              <p className="font-medium text-zinc-300">{property.contactName}</p>
              <a
                href={`tel:${property.contactPhone}`}
                className="flex items-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-4 py-3 rounded-xl text-sm transition-all justify-center shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
                {property.contactPhone}
              </a>
              {property.contactEmail && (
                <a
                  href={`mailto:${property.contactEmail}`}
                  className="flex items-center gap-2 w-full bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 text-zinc-300 font-medium px-4 py-3 rounded-xl text-sm transition-all justify-center"
                >
                  <Mail className="w-4 h-4" />
                  Send email
                </a>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-zinc-600 mt-4 justify-center">
              <Eye className="w-3 h-3" /> {property.views} views
            </div>
          </div>

          {/* AI Predict - Auto-fill from this listing */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-zinc-900/60 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-[30px]" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
                <p className="font-semibold text-emerald-400 text-sm">AI Price Check</p>
              </div>
              <p className="text-zinc-400 text-xs mb-3">Auto-fill this property&apos;s details into our ML model to verify the price.</p>
              <Link
                href={`/predict?${predictParams.toString()}`}
                className="block text-center text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
              >
                Verify with AI →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
