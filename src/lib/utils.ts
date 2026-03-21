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

// Base monthly market rent (USD) per suburb — used by pricing algorithms
export const SUBURB_BASE_PRICES: Record<string, number> = {
  "CBD":             450,
  "Greenside":       400,
  "Morningside":     380,
  "Hobhouse":        330,
  "Yeovil":          340,
  "Renishaw":        360,
  "Silverstream":    300,
  "Christmas Pass":  280,
  "Fairbridge":      290,
  "Chikanga":        270,
  "Westlea":         280,
  "Fernvalley":      260,
  "Mutasa Park":     230,
  "Chisamba":        210,
  "Murambi":         215,
  "Zimta":           205,
  "Dangamvura":      195,
  "Paulington":      170,
  "Weirmouth":       175,
  "Sakubva":         160,
  "Zimunya":         145,
  "Penhalonga":      170,
  "Bvumba":          310,
  "Burma Valley":    255,
};

export const MUTARE_CENTER = { lat: -18.9558, lng: 32.6504 };
export const SUBURBS = Object.keys(MUTARE_SUBURBS).sort();
