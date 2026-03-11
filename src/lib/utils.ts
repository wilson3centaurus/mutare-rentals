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

// Mutare suburb coordinates lookup
export const MUTARE_SUBURBS: Record<string, { lat: number; lng: number }> = {
  "Chikanga": { lat: -18.9337, lng: 32.6292 },
  "Dangamvura": { lat: -18.9800, lng: 32.6700 },
  "Greenside": { lat: -18.9500, lng: 32.6400 },
  "Hobhouse": { lat: -18.9450, lng: 32.6350 },
  "Morningside": { lat: -18.9600, lng: 32.6550 },
  "Murambi": { lat: -18.9700, lng: 32.6800 },
  "Sakubva": { lat: -18.9650, lng: 32.6600 },
  "Yeovil": { lat: -18.9550, lng: 32.6480 },
  "Fairbridge": { lat: -18.9400, lng: 32.6300 },
  "Penhalonga": { lat: -18.8900, lng: 32.6800 },
  "Zimta": { lat: -18.9750, lng: 32.6650 },
  "CBD": { lat: -18.9558, lng: 32.6504 },
};

export const MUTARE_CENTER = { lat: -18.9558, lng: 32.6504 };

export const SUBURBS = Object.keys(MUTARE_SUBURBS);
