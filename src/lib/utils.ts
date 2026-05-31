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
  "Darlington":      { lat: -18.9420, lng: 32.6580 },
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
// Tier 1 — Premium low-density suburbs (Murambi, Darlington, Morningside, Fairbridge, Greenside):
//   Full house (2-bed) $500–600 | Room $100–120
//
// Tier 2 — Mid-density suburbs (Hobhouse, Chikanga, Dangamvura, CBD, Christmas Pass, etc.):
//   Full house (2-bed) $250–320 | Room $60–70
//
// Tier 3 — Peri-urban / high-density (Paulington, Zimta, Weirmouth, Zimunya, Burma Valley):
//   Full house $180–230 | Room $40–55
export const SUBURB_BASE_PRICES: Record<string, number> = {
  // ── Tier 1: Premium low-density ──────────────────────────────────────────
  "Murambi":         510,  // premier low-density; 2-bed ~$570, room ~$112
  "Darlington":      510,  // premium low-density, similar to Murambi
  "Morningside":     500,  // affluent hillside suburb; 2-bed ~$560, room ~$110
  "Fairbridge":      490,  // established low-density, large plots; 2-bed ~$549
  "Greenside":       480,  // upmarket near golf course; 2-bed ~$538
  // ── Tier 2: Mid-density ──────────────────────────────────────────────────
  "CBD":             290,  // commercial + residential mix; 2-bed ~$325, room ~$64
  "Christmas Pass":  275,  // gateway suburb; 2-bed ~$308, room ~$60
  "Hobhouse":        270,  // mid-density; 2-bed ~$302, room ~$59
  "Chikanga":        270,  // large mid-density township; 2-bed ~$302, room ~$59
  "Dangamvura":      270,  // high-density main suburb; 2-bed ~$302, room ~$59
  "Bvumba":          265,  // scenic, tourism-adjacent; 2-bed ~$297
  "Renishaw":        260,  // quiet residential; 2-bed ~$291, room ~$57
  "Westlea":         255,  // mid-density, growing; 2-bed ~$286, room ~$56
  "Silverstream":    250,  // mid-density; 2-bed ~$280, room ~$55
  "Yeovil":          250,  // mid-density residential; 2-bed ~$280
  "Fernvalley":      245,  // mid-density; 2-bed ~$274, room ~$54
  "Chisamba":        245,  // high-density, affordable; 2-bed ~$274
  "Sakubva":         245,  // busy high-density; 2-bed ~$274, room ~$54
  "Mutasa Park":     240,  // mid-density, older stock; 2-bed ~$269
  // ── Tier 3: Peri-urban / affordable ─────────────────────────────────────
  "Burma Valley":    220,  // rural-adjacent; 2-bed ~$246
  "Penhalonga":      215,  // mining town fringe; 2-bed ~$241
  "Paulington":      205,  // high-density; 2-bed ~$230
  "Zimta":           195,  // high-density, basic infra; 2-bed ~$219
  "Weirmouth":       195,  // high-density, peri-urban; 2-bed ~$219
  "Zimunya":         180,  // peri-urban; 2-bed ~$202
};

export const MUTARE_CENTER = { lat: -18.9558, lng: 32.6504 };
export const SUBURBS = Object.keys(MUTARE_SUBURBS).sort();
