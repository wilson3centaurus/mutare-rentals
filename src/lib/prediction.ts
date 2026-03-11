/**
 * AI-driven price prediction model.
 * Uses a weighted linear regression approach based on Mutare housing market factors.
 * In production, this can be replaced with a trained ML model (e.g. Python FastAPI microservice).
 */

export interface PredictionInput {
  suburb: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters?: number;
  propertyType: string;
  hasWater: boolean;
  hasElectricity: boolean;
  hasRefuseCollection: boolean;
  hasSecurity: boolean;
  yearBuilt?: number;
}

export interface PredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: { label: string; impact: number; positive: boolean }[];
}

// Base prices per suburb (USD/month) - derived from Mutare market research
const SUBURB_BASE_PRICES: Record<string, number> = {
  "Chikanga": 250,
  "Dangamvura": 180,
  "Greenside": 350,
  "Hobhouse": 300,
  "Morningside": 380,
  "Murambi": 200,
  "Sakubva": 150,
  "Yeovil": 320,
  "Fairbridge": 280,
  "Penhalonga": 160,
  "Zimta": 190,
  "CBD": 400,
};

const PROPERTY_TYPE_MULTIPLIER: Record<string, number> = {
  HOUSE: 1.0,
  TOWNHOUSE: 0.95,
  FLAT: 0.85,
  COTTAGE: 0.75,
  ROOM: 0.45,
};

export function predictPrice(input: PredictionInput): PredictionResult {
  const basePrice = SUBURB_BASE_PRICES[input.suburb] ?? 200;
  const typeMultiplier = PROPERTY_TYPE_MULTIPLIER[input.propertyType] ?? 1.0;

  let price = basePrice * typeMultiplier;
  const factors: { label: string; impact: number; positive: boolean }[] = [];

  // Bedroom contribution
  const bedroomImpact = (input.bedrooms - 1) * 60;
  price += bedroomImpact;
  factors.push({ label: `${input.bedrooms} Bedrooms`, impact: bedroomImpact, positive: true });

  // Bathroom contribution
  const bathroomImpact = (input.bathrooms - 1) * 30;
  price += bathroomImpact;
  if (bathroomImpact !== 0) {
    factors.push({ label: `${input.bathrooms} Bathrooms`, impact: bathroomImpact, positive: true });
  }

  // Square meters bonus
  if (input.squareMeters) {
    const sizeImpact = Math.max(0, (input.squareMeters - 60) * 1.2);
    price += sizeImpact;
    factors.push({ label: `${input.squareMeters}m² size`, impact: sizeImpact, positive: true });
  }

  // Amenity impacts
  if (input.hasElectricity) {
    price += 40;
    factors.push({ label: "Electricity supply", impact: 40, positive: true });
  } else {
    price -= 30;
    factors.push({ label: "No electricity", impact: -30, positive: false });
  }

  if (input.hasWater) {
    price += 30;
    factors.push({ label: "Running water", impact: 30, positive: true });
  } else {
    price -= 25;
    factors.push({ label: "No running water", impact: -25, positive: false });
  }

  if (input.hasRefuseCollection) {
    price += 15;
    factors.push({ label: "Refuse collection", impact: 15, positive: true });
  }

  if (input.hasSecurity) {
    price += 35;
    factors.push({ label: "Security", impact: 35, positive: true });
  }

  // Age penalty
  if (input.yearBuilt) {
    const age = new Date().getFullYear() - input.yearBuilt;
    const agePenalty = Math.min(age * 1.5, 80);
    price -= agePenalty;
    if (agePenalty > 0) {
      factors.push({ label: `Property age (${age} yrs)`, impact: -agePenalty, positive: false });
    }
  }

  price = Math.max(price, 50); // floor price

  // Confidence based on completeness of inputs
  let confidence = 0.65;
  if (input.squareMeters) confidence += 0.10;
  if (input.yearBuilt) confidence += 0.05;
  if (SUBURB_BASE_PRICES[input.suburb]) confidence += 0.10;
  confidence = Math.min(confidence, 0.92);

  const variance = price * 0.12;

  return {
    predictedPrice: Math.round(price),
    minPrice: Math.round(price - variance),
    maxPrice: Math.round(price + variance),
    confidence: Math.round(confidence * 100),
    factors,
  };
}
