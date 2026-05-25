import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatZWL(amount: number): string {
  return `ZWL ${amount.toLocaleString("en-ZW")}`;
}

// Mutare suburb coordinates lookup — expanded with all major suburbs
export const MUTARE_SUBURBS: Record<string, { lat: number; lng: number }> = {
  "CBD":             { lat: -18.9558, lng: 32.6504 },
  "Greenside":       { lat: -18.9500, lng: 32.6400 },
  "Morningside":     { lat: -18.9600, lng: 32.6550 },
  "Hobhouse":        { lat: -18.9450, lng: 32.6350 },
  "Yeovil":          { lat: -18.9550, lng: 32.6480 },
  "Fairbridge":      { lat: -18.9400, lng: 32.6300 },
  "Renishaw":        { lat: -18.9320, lng: 32.6450 },
  "Silverstream":    { lat: -18.9350, lng: 32.6450 },
  "Christmas Pass":  { lat: -18.9300, lng: 32.6700 },
  "Chikanga":        { lat: -18.9337, lng: 32.6292 },
  "Westlea":         { lat: -18.9430, lng: 32.6220 },
  "Fernvalley":      { lat: -18.9480, lng: 32.6180 },
  "Mutasa Park":     { lat: -18.9510, lng: 32.6600 },
  "Chisamba":        { lat: -18.9380, lng: 32.6520 },
  "Murambi":         { lat: -18.9700, lng: 32.6800 },
  "Zimta":           { lat: -18.9750, lng: 32.6650 },
  "Dangamvura":      { lat: -18.9800, lng: 32.6700 },
  "Paulington":      { lat: -18.9680, lng: 32.6560 },
  "Weirmouth":       { lat: -18.9820, lng: 32.6540 },
  "Sakubva":         { lat: -18.9650, lng: 32.6600 },
  "Zimunya":         { lat: -19.0100, lng: 32.6900 },
  "Penhalonga":      { lat: -18.8900, lng: 32.6800 },
  "Bvumba":          { lat: -18.9780, lng: 32.7800 },
  "Burma Valley":    { lat: -18.9000, lng: 32.7500 },
};

// Base monthly market rent (USD) per suburb — 2-bed standard brick house baseline
// Calibrated to actual Mutare, Zimbabwe rental market (2025/2026 USD prices)
//
// Tier 1 — Low-density / Upmarket suburbs (leafy, large stands, walled):
//   Murambi, Morningside, Fairbridge, Greenside, Hobhouse, Renishaw, Silverstream, Yeovil
//   Reality: 2-bed ~$200–280, 3-bed ~$300–450, 4-bed+ ~$450–600
//
// Tier 2 — Mid-density suburbs:
//   Chikanga, Westlea, Mutasa Park, CBD, Fernvalley, Christmas Pass, Bvumba
//   Reality: 2-bed ~$120–180, 3-bed ~$180–280
//
// Tier 3 — High-density suburbs:
//   Sakubva, Dangamvura, Paulington, Zimta, Zimunya, Weirmouth, Chisamba
//   Reality: 2-bed ~$60–100, rooms ~$30–60
export const SUBURB_BASE_PRICES: Record<string, number> = {
  // ── Tier 1: Low-density, expensive ──────────────────────────────────────
  "Murambi":         250,  // premium low-density; 2-bed base ~$250, 3-bed ~$380
  "Morningside":     230,  // affluent hillside suburb, similar to Murambi
  "Fairbridge":      220,  // established low-density, large plots
  "Greenside":       210,  // upmarket, near golf course
  "Hobhouse":        200,  // good low-density area
  "Renishaw":        195,  // quiet low-density
  "Silverstream":    185,  // low-density, slightly further
  "Yeovil":          180,  // low-density residential
  // ── Tier 2: Mid-density ─────────────────────────────────────────────────
  "CBD":             160,  // commercial + residential mix; convenience premium
  "Christmas Pass":  150,  // gateway suburb, decent infrastructure
  "Bvumba":          145,  // scenic, some tourism; limited rental stock
  "Chikanga":        130,  // large mid-density township; well-served
  "Westlea":         125,  // mid-density, growing area
  "Fernvalley":      120,  // mid-density residential
  "Mutasa Park":     115,  // mid-density, slightly older stock
  "Burma Valley":    110,  // rural-adjacent; limited amenities
  "Penhalonga":      105,  // mining town fringe
  // ── Tier 3: High-density ────────────────────────────────────────────────
  "Chisamba":         90,  // high-density, affordable
  "Sakubva":          80,  // one of Mutare's busiest high-density suburbs
  "Dangamvura":       75,  // large high-density; very affordable
  "Paulington":       70,  // high-density
  "Zimta":            65,  // high-density, basic infrastructure
  "Weirmouth":        65,  // high-density, peri-urban
  "Zimunya":          55,  // peri-urban high-density; limited services
};

export const MUTARE_CENTER = { lat: -18.9558, lng: 32.6504 };
export const SUBURBS = Object.keys(MUTARE_SUBURBS).sort();
