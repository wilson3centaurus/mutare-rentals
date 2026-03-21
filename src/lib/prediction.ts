/**
 * Mutare Rentals â€” Pricing Algorithms
 *
 * Three deterministic algorithms are implemented:
 *  1. Hedonic Pricing Model  â€” linear regression on property attributes
 *  2. Comparable Sales Analysis â€” adjustment grid from suburb market comps
 *  3. Cost Approach  â€” replacement-cost depreciation converted to rental yield
 *
 * All coefficients are calibrated to the Mutare, Zimbabwe rental market (USD/month).
 */

import { SUBURB_BASE_PRICES } from "@/lib/utils";

export type PricingAlgorithm = "HEDONIC" | "COMPARABLE_SALES" | "COST_APPROACH";

export interface PredictionInput {
  suburb: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters?: number;
  propertyType: string;
  listingType?: string;
  hasWater: boolean;
  hasElectricity: boolean;
  hasRefuseCollection: boolean;
  hasSecurity: boolean;
  hasWifi?: boolean;
  hasBorehole?: boolean;
  hasDriveway?: boolean;
  hasPool?: boolean;
  hasGenerator?: boolean;
  hasSolarPower?: boolean;
  yearBuilt?: number;
  houseConstruction?: string;
  roofType?: string;
  windowCondition?: string;
  wallCondition?: string;
  bathroomType?: string;
  algorithm?: PricingAlgorithm;
}

export interface PredictionStep {
  step: string;
  value: number;
  note: string;
}

export interface PredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  algorithm: PricingAlgorithm;
  factors: { label: string; impact: number; positive: boolean }[];
  steps: PredictionStep[];
}

// â”€â”€â”€ Shared lookup tables â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PROPERTY_TYPE_MULTIPLIER: Record<string, number> = {
  HOUSE: 1.00, TOWNHOUSE: 0.92, FLAT: 0.82, COTTAGE: 0.72, ROOM: 0.40,
};

// Construction quality index (0â€“1)
const CONSTRUCTION_QUALITY: Record<string, number> = {
  STONE: 1.0, BRICK: 0.85, MIXED: 0.65, WOOD: 0.45, METAL: 0.30,
};

// Roof quality index (0â€“1)
const ROOF_QUALITY: Record<string, number> = {
  CONCRETE: 1.0, TILES: 0.90, ASBESTOS: 0.60, IRON_SHEETS: 0.45, THATCH: 0.35,
};

// Condition factor (multiplier on structure value)
const CONDITION_FACTOR: Record<string, number> = {
  EXCELLENT: 1.0, GOOD: 0.88, FAIR: 0.72, POOR: 0.52,
};

// Construction cost per mÂ² (USD, replacement value)
const CONSTRUCTION_COST_PER_SQM: Record<string, number> = {
  STONE: 420, BRICK: 360, MIXED: 290, WOOD: 210, METAL: 180,
};

// â”€â”€â”€ 1. Hedonic Pricing Model â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// P = BaseSuburb Ã— TypeMultiplier
//     + Î²_bed Ã— (bedrooms âˆ’ 1)
//     + Î²_bath Ã— (bathrooms âˆ’ 1)
//     + Î²_size Ã— max(0, sqm âˆ’ 50)
//     + Î£ construction/condition adjustments
//     + Î£ amenity contributions
//     âˆ’ age_depreciation

export function hedonicPredict(input: PredictionInput): PredictionResult {
  const base = SUBURB_BASE_PRICES[input.suburb] ?? 200;
  const typeM = PROPERTY_TYPE_MULTIPLIER[input.propertyType] ?? 1.0;
  let price = base * typeM;
  const factors: PredictionResult["factors"] = [];
  const steps: PredictionStep[] = [
    { step: "Suburb base rent", value: base, note: `Market median for ${input.suburb}` },
    { step: "Property type multiplier", value: Math.round(base * typeM), note: `${input.propertyType} â†’ Ã—${typeM}` },
  ];

  // Bedrooms (Î² = 65)
  const bedImpact = (input.bedrooms - 1) * 65;
  price += bedImpact;
  if (bedImpact !== 0) {
    factors.push({ label: `${input.bedrooms} Bedrooms`, impact: bedImpact, positive: bedImpact >= 0 });
    steps.push({ step: "Bedroom premium", value: bedImpact, note: `(${input.bedrooms} âˆ’ 1) Ã— $65/bed` });
  }

  // Bathrooms (Î² = 35)
  const bathImpact = (input.bathrooms - 1) * 35;
  price += bathImpact;
  if (bathImpact !== 0) {
    factors.push({ label: `${input.bathrooms} Bathrooms`, impact: bathImpact, positive: bathImpact >= 0 });
    steps.push({ step: "Bathroom premium", value: bathImpact, note: `(${input.bathrooms} âˆ’ 1) Ã— $35/bath` });
  }

  // Size (Î² = 1.5 per mÂ² above 50mÂ²)
  if (input.squareMeters) {
    const sizeImpact = Math.max(0, (input.squareMeters - 50) * 1.5);
    price += sizeImpact;
    if (sizeImpact > 0) {
      factors.push({ label: `${input.squareMeters}mÂ² floor area`, impact: sizeImpact, positive: true });
      steps.push({ step: "Size premium", value: sizeImpact, note: `(${input.squareMeters} âˆ’ 50) Ã— $1.50/mÂ²` });
    }
  }

  // Construction quality
  const cq = CONSTRUCTION_QUALITY[input.houseConstruction ?? "BRICK"] ?? 0.85;
  const constImpact = Math.round((cq - 0.85) * 80); // brick is baseline 0
  price += constImpact;
  if (constImpact !== 0) {
    factors.push({ label: `${input.houseConstruction ?? "BRICK"} construction`, impact: constImpact, positive: constImpact >= 0 });
    steps.push({ step: "Construction quality", value: constImpact, note: `Quality index ${cq} vs baseline 0.85` });
  }

  // Roof quality
  const rq = ROOF_QUALITY[input.roofType ?? "IRON_SHEETS"] ?? 0.45;
  const roofImpact = Math.round((rq - 0.45) * 55); // iron sheets is baseline
  price += roofImpact;
  if (roofImpact !== 0) {
    factors.push({ label: `${input.roofType ?? "IRON_SHEETS"} roof`, impact: roofImpact, positive: roofImpact >= 0 });
    steps.push({ step: "Roof quality", value: roofImpact, note: `Quality index ${rq} vs baseline 0.45` });
  }

  // Wall condition
  const wallF = CONDITION_FACTOR[input.wallCondition ?? "GOOD"] ?? 0.88;
  const wallImpact = Math.round((wallF - 0.88) * 70);
  price += wallImpact;
  if (wallImpact !== 0) {
    factors.push({ label: `Wall condition: ${input.wallCondition}`, impact: wallImpact, positive: wallImpact >= 0 });
    steps.push({ step: "Wall condition", value: wallImpact, note: `Condition factor ${wallF} vs baseline 0.88` });
  }

  // Window condition
  const winF = CONDITION_FACTOR[input.windowCondition ?? "GOOD"] ?? 0.88;
  const winImpact = Math.round((winF - 0.88) * 35);
  price += winImpact;
  if (winImpact !== 0) {
    factors.push({ label: `Window condition: ${input.windowCondition}`, impact: winImpact, positive: winImpact >= 0 });
    steps.push({ step: "Window condition", value: winImpact, note: `Condition factor ${winF} vs baseline 0.88` });
  }

  // Bathroom type
  const bathroomImpacts: Record<string, number> = { SHOWER_AND_TUB: 30, SHOWER_ONLY: 10, TUB_ONLY: 5, NONE: -35 };
  const bathTypeImpact = bathroomImpacts[input.bathroomType ?? "SHOWER_ONLY"] ?? 10;
  price += bathTypeImpact;
  if (bathTypeImpact !== 0) {
    factors.push({ label: `Bathroom: ${input.bathroomType ?? "SHOWER_ONLY"}`, impact: bathTypeImpact, positive: bathTypeImpact >= 0 });
    steps.push({ step: "Bathroom fittings", value: bathTypeImpact, note: `${input.bathroomType ?? "SHOWER_ONLY"} premium` });
  }

  // Utilities and amenities
  const amenities: [boolean | undefined, string, number][] = [
    [input.hasElectricity, "Mains electricity", 45],
    [input.hasWater, "Running water", 35],
    [input.hasSecurity, "Security", 40],
    [input.hasWifi, "WiFi connectivity", 25],
    [input.hasBorehole, "Borehole water", 20],
    [input.hasGenerator, "Generator backup", 35],
    [input.hasSolarPower, "Solar power", 30],
    [input.hasPool, "Swimming pool", 60],
    [input.hasDriveway, "Driveway/parking", 15],
    [input.hasRefuseCollection, "Refuse collection", 15],
  ];
  for (const [has, label, impact] of amenities) {
    if (has) {
      price += impact;
      factors.push({ label, impact, positive: true });
    } else if (has === false && (label === "Mains electricity" || label === "Running water")) {
      price -= Math.round(impact * 0.6);
      factors.push({ label: `No ${label.toLowerCase()}`, impact: -Math.round(impact * 0.6), positive: false });
    }
  }

  // Age depreciation (up to 25%)
  if (input.yearBuilt) {
    const age = new Date().getFullYear() - input.yearBuilt;
    const agePct = Math.min(age * 0.015, 0.25);
    const agePenalty = -Math.round(price * agePct);
    price += agePenalty;
    factors.push({ label: `Property age: ${age} years`, impact: agePenalty, positive: false });
    steps.push({ step: "Age depreciation", value: agePenalty, note: `${(agePct * 100).toFixed(1)}% depreciation (${age} yrs Ã— 1.5%/yr, max 25%)` });
  }

  price = Math.max(price, 50);
  steps.push({ step: "Final hedonic rent", value: Math.round(price), note: "Sum of all additive adjustments" });

  let confidence = 0.62;
  if (input.squareMeters) confidence += 0.08;
  if (input.yearBuilt) confidence += 0.05;
  if (input.houseConstruction) confidence += 0.05;
  if (input.wallCondition) confidence += 0.04;
  if (SUBURB_BASE_PRICES[input.suburb]) confidence += 0.08;
  confidence = Math.min(confidence, 0.91);
  const variance = price * 0.10;

  return {
    predictedPrice: Math.round(price),
    minPrice: Math.round(price - variance),
    maxPrice: Math.round(price + variance),
    confidence: Math.round(confidence * 100),
    algorithm: "HEDONIC",
    factors,
    steps,
  };
}

// â”€â”€â”€ 2. Comparable Sales Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Starts from the suburb median (2-bed, standard brick house).
// Each spec difference is expressed as a % adjustment:
//   price = median Ã— Î (1 + adj_i)
// Adjustments are multiplicative to reflect real estate comps practice.

export function comparableSalesPredict(input: PredictionInput): PredictionResult {
  const base = SUBURB_BASE_PRICES[input.suburb] ?? 200;
  const typeM = PROPERTY_TYPE_MULTIPLIER[input.propertyType] ?? 1.0;
  let price = base * typeM;
  const factors: PredictionResult["factors"] = [];
  const steps: PredictionStep[] = [
    { step: "Suburb median comp", value: base, note: `Median 2-bed, BRICK, standard house in ${input.suburb}` },
    { step: "After type adjustment", value: Math.round(price), note: `${input.propertyType} Ã— ${typeM}` },
  ];

  // Each adjustment expressed as % of current price
  function adjust(pct: number, label: string, note: string) {
    const impact = Math.round(price * pct);
    price += impact;
    if (Math.abs(impact) >= 1) {
      factors.push({ label, impact, positive: impact >= 0 });
      steps.push({ step: label, value: impact, note });
    }
  }

  // Bedrooms vs baseline of 2
  const bedDiff = input.bedrooms - 2;
  adjust(bedDiff * 0.18, `${input.bedrooms} bedrooms`, `${bedDiff > 0 ? "+" : ""}${bedDiff} bed vs 2-bed comp â†’ ${bedDiff * 18}% adj`);

  // Bathrooms vs baseline of 1
  const bathDiff = input.bathrooms - 1;
  adjust(bathDiff * 0.09, `${input.bathrooms} bathrooms`, `${bathDiff > 0 ? "+" : ""}${bathDiff} bath vs 1-bath comp â†’ ${bathDiff * 9}% adj`);

  // Size vs baseline of 70mÂ²
  if (input.squareMeters) {
    const sizeDiff = (input.squareMeters - 70) / 70;
    adjust(sizeDiff * 0.20, `${input.squareMeters}mÂ² vs 70mÂ² comp`, `Size ratio ${(sizeDiff * 100).toFixed(0)}% â†’ 20% weight`);
  }

  // Construction quality vs BRICK baseline
  const cq = CONSTRUCTION_QUALITY[input.houseConstruction ?? "BRICK"] ?? 0.85;
  const cAdj = (cq - 0.85) * 0.25;
  adjust(cAdj, `${input.houseConstruction ?? "BRICK"} construction`, `Quality ${cq} vs comp baseline 0.85 â†’ Ã—${(0.25 * 100).toFixed(0)}% weight`);

  // Roof quality vs IRON_SHEETS baseline
  const rq = ROOF_QUALITY[input.roofType ?? "IRON_SHEETS"] ?? 0.45;
  const rAdj = (rq - 0.45) * 0.15;
  adjust(rAdj, `${input.roofType ?? "IRON_SHEETS"} roof`, `Quality ${rq} vs comp baseline 0.45 â†’ Ã—15% weight`);

  // Condition
  const wf = CONDITION_FACTOR[input.wallCondition ?? "GOOD"] ?? 0.88;
  adjust((wf - 0.88) * 0.20, `Wall condition: ${input.wallCondition ?? "GOOD"}`, `Factor ${wf} vs 0.88 baseline`);

  // Amenity bundle vs standard (water + electricity)
  const amenityScore =
    (input.hasElectricity ? 0.10 : -0.07) +
    (input.hasWater ? 0.08 : -0.06) +
    (input.hasSecurity ? 0.09 : 0) +
    (input.hasWifi ? 0.06 : 0) +
    (input.hasBorehole ? 0.05 : 0) +
    (input.hasPool ? 0.14 : 0) +
    (input.hasGenerator ? 0.08 : 0) +
    (input.hasSolarPower ? 0.07 : 0) +
    (input.hasDriveway ? 0.04 : 0) +
    (input.hasRefuseCollection ? 0.03 : 0);
  adjust(amenityScore, "Amenity bundle", `Aggregate amenity score vs standard comp`);

  // Age discount
  if (input.yearBuilt) {
    const age = new Date().getFullYear() - input.yearBuilt;
    const ageAdj = -Math.min(age * 0.012, 0.25);
    adjust(ageAdj, `Property age (${age} yrs)`, `${(Math.abs(ageAdj) * 100).toFixed(1)}% comparable age discount`);
  }

  price = Math.max(price, 50);
  steps.push({ step: "Final comparable sales estimate", value: Math.round(price), note: "Multiplicative adjustments applied to suburb median comp" });

  let confidence = 0.65;
  if (input.squareMeters) confidence += 0.07;
  if (input.yearBuilt) confidence += 0.05;
  if (input.houseConstruction) confidence += 0.04;
  if (SUBURB_BASE_PRICES[input.suburb]) confidence += 0.07;
  confidence = Math.min(confidence, 0.90);
  const variance = price * 0.11;

  return {
    predictedPrice: Math.round(price),
    minPrice: Math.round(price - variance),
    maxPrice: Math.round(price + variance),
    confidence: Math.round(confidence * 100),
    algorithm: "COMPARABLE_SALES",
    factors,
    steps,
  };
}

// â”€â”€â”€ 3. Cost Approach â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Property Value = (Construction Replacement Cost + Land Premium) Ã— Condition
// Monthly Rent   = Property Value Ã— Gross Rental Yield (8.5%) / 12
//
// Works best for newer properties where construction costs are known.

export function costApproachPredict(input: PredictionInput): PredictionResult {
  const sqm = input.squareMeters ?? 65; // assume 65mÂ² if unknown
  const base = SUBURB_BASE_PRICES[input.suburb] ?? 200;
  const factors: PredictionResult["factors"] = [];
  const steps: PredictionStep[] = [];

  // 1. Replacement construction cost
  const costPerSqm = CONSTRUCTION_COST_PER_SQM[input.houseConstruction ?? "BRICK"] ?? 360;
  const constructionCost = costPerSqm * sqm;
  steps.push({ step: "Replacement construction cost", value: constructionCost, note: `$${costPerSqm}/mÂ² Ã— ${sqm}mÂ² (${input.houseConstruction ?? "BRICK"})` });

  // 2. Roof cost component (~15% of structure)
  const rq = ROOF_QUALITY[input.roofType ?? "IRON_SHEETS"] ?? 0.45;
  const roofCost = constructionCost * 0.15 * rq;
  steps.push({ step: "Roof component value", value: Math.round(roofCost), note: `15% of structure Ã— quality ${rq} (${input.roofType ?? "IRON_SHEETS"})` });

  // 3. Total structure value
  const structureValue = constructionCost + roofCost;
  steps.push({ step: "Total structure value", value: Math.round(structureValue), note: "Construction + roof" });

  // 4. Accrued depreciation
  const condFactor = CONDITION_FACTOR[input.wallCondition ?? "GOOD"] ?? 0.88;
  let ageFactor = 1.0;
  if (input.yearBuilt) {
    const age = new Date().getFullYear() - input.yearBuilt;
    ageFactor = Math.max(0.40, 1 - age * 0.018); // 1.8% per year, floor 40%
    steps.push({ step: "Age depreciation factor", value: Math.round(ageFactor * 100), note: `${age} yrs Ã— 1.8%/yr, floor 40%` });
  }
  const depreciated = structureValue * condFactor * ageFactor;
  steps.push({ step: "Depreciated structure value", value: Math.round(depreciated), note: `Condition ${condFactor} Ã— age factor ${ageFactor.toFixed(2)}` });

  // 5. Land value premium (derived from suburb price index)
  const landFactor = base / 200; // 200 is the market baseline suburb
  const landValue = sqm * 18 * landFactor; // ~$18/mÂ² land, suburb-adjusted
  steps.push({ step: "Land value component", value: Math.round(landValue), note: `$18/mÂ² Ã— ${sqm}mÂ² Ã— suburb factor ${landFactor.toFixed(2)}` });
  factors.push({ label: `${input.suburb} land premium`, impact: Math.round(landValue), positive: true });

  // 6. Total property value
  const propertyValue = depreciated + landValue;
  steps.push({ step: "Total property value", value: Math.round(propertyValue), note: "Depreciated structure + land" });

  // 7. Amenity value additions ($ capital value)
  const amenityAdditions: [boolean | undefined, string, number][] = [
    [input.hasElectricity, "Mains electricity connection", 3500],
    [input.hasWater, "Reticulated water supply", 2800],
    [input.hasBorehole, "Borehole & pump", 4500],
    [input.hasPool, "Swimming pool", 8000],
    [input.hasGenerator, "Generator installation", 4000],
    [input.hasSolarPower, "Solar PV system", 5500],
    [input.hasSecurity, "Security fencing & gate", 2500],
    [input.hasDriveway, "Paved driveway", 1200],
    [input.hasRefuseCollection, "Refuse collection service", 300],
  ];
  let amenityCapital = 0;
  for (const [has, lbl, val] of amenityAdditions) {
    if (has) {
      amenityCapital += val;
      factors.push({ label: lbl, impact: Math.round(val * 0.085 / 12), positive: true });
    }
  }
  if (amenityCapital > 0) steps.push({ step: "Amenity capital additions", value: amenityCapital, note: "Capital cost of installed amenities" });

  // 8. Bathroom fittings capital
  const bathCapital: Record<string, number> = { SHOWER_AND_TUB: 4000, SHOWER_ONLY: 1800, TUB_ONLY: 1500, NONE: 0 };
  const bCap = bathCapital[input.bathroomType ?? "SHOWER_ONLY"] ?? 1800;
  if (bCap > 0) steps.push({ step: "Bathroom fittings capital", value: bCap, note: `${input.bathroomType ?? "SHOWER_ONLY"} fitting value` });

  const totalValue = propertyValue + amenityCapital + bCap;
  steps.push({ step: "Total asset value", value: Math.round(totalValue), note: "Structure + land + amenities + fittings" });

  // 9. Monthly rent via gross rental yield (8.5% p.a.)
  const RENTAL_YIELD = 0.085;
  let monthlyRent = (totalValue * RENTAL_YIELD) / 12;

  // Bedroom adjustment (more bedrooms = more rent even if not more mÂ²)
  const bedPremium = (input.bedrooms - 2) * 0.08; // +8% per extra bed above 2
  monthlyRent *= (1 + bedPremium);
  if (bedPremium !== 0) {
    const bedImpact = Math.round((totalValue * RENTAL_YIELD / 12) * bedPremium);
    factors.push({ label: `${input.bedrooms} bedrooms`, impact: bedImpact, positive: bedImpact >= 0 });
    steps.push({ step: "Bedroom yield adjustment", value: bedImpact, note: `(${input.bedrooms} âˆ’ 2) Ã— 8% bedroom premium` });
  }

  // WiFi is purely rental market (no capital value)
  if (input.hasWifi) {
    monthlyRent += 25;
    factors.push({ label: "WiFi connectivity", impact: 25, positive: true });
  }

  monthlyRent = Math.max(monthlyRent, 50);
  steps.push({ step: "Monthly rent (8.5% yield Ã· 12)", value: Math.round(monthlyRent), note: `($${Math.round(totalValue)} Ã— 8.5%) Ã· 12 months` });

  let confidence = 0.60;
  if (input.squareMeters) confidence += 0.10; // most sensitive to size
  if (input.yearBuilt) confidence += 0.08;
  if (input.houseConstruction) confidence += 0.06;
  if (input.wallCondition) confidence += 0.04;
  if (SUBURB_BASE_PRICES[input.suburb]) confidence += 0.05;
  confidence = Math.min(confidence, 0.88);
  const variance = monthlyRent * 0.13;

  return {
    predictedPrice: Math.round(monthlyRent),
    minPrice: Math.round(monthlyRent - variance),
    maxPrice: Math.round(monthlyRent + variance),
    confidence: Math.round(confidence * 100),
    algorithm: "COST_APPROACH",
    factors,
    steps,
  };
}

// â”€â”€â”€ Unified entry point â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function predictPrice(input: PredictionInput): PredictionResult {
  const algo = input.algorithm ?? "HEDONIC";
  switch (algo) {
    case "COMPARABLE_SALES": return comparableSalesPredict(input);
    case "COST_APPROACH":    return costApproachPredict(input);
    default:                 return hedonicPredict(input);
  }
}
