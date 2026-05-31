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
  HOUSE: 1.00, TOWNHOUSE: 0.92, FLAT: 0.82, COTTAGE: 0.72, ROOM: 0.22,
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
  // If listing type is ROOM, enforce the ROOM multiplier regardless of propertyType
  const effectiveType = input.listingType === "ROOM" ? "ROOM" : input.propertyType;
  const typeM = PROPERTY_TYPE_MULTIPLIER[effectiveType] ?? 1.0;
  let price = base * typeM;
  const factors: PredictionResult["factors"] = [];
  const steps: PredictionStep[] = [
    { step: "Suburb base rent", value: base, note: `Market median for ${input.suburb}` },
    { step: "Property type multiplier", value: Math.round(base * typeM), note: `${effectiveType} → ×${typeM}` },
  ];

  // Bedrooms (β = $30 per extra bedroom above 1, or 12% of base — whichever is less extreme)
  // In high-density suburbs a 3-bed house is only ~30–40% more than a 1-bed, not 2×
  const bedIncrement = Math.round(base * 0.12); // 12% of suburb base per extra bed
  const bedImpact = (input.bedrooms - 1) * bedIncrement;
  price += bedImpact;
  if (bedImpact !== 0) {
    factors.push({ label: `${input.bedrooms} Bedrooms`, impact: bedImpact, positive: bedImpact >= 0 });
    steps.push({ step: "Bedroom premium", value: bedImpact, note: `(${input.bedrooms} − 1) × $${bedIncrement} (12% of suburb base)` });
  }

  // Bathrooms (β = 5% of base per extra bathroom)
  const bathIncrement = Math.round(base * 0.05);
  const bathImpact = (input.bathrooms - 1) * bathIncrement;
  price += bathImpact;
  if (bathImpact !== 0) {
    factors.push({ label: `${input.bathrooms} Bathrooms`, impact: bathImpact, positive: bathImpact >= 0 });
    steps.push({ step: "Bathroom premium", value: bathImpact, note: `(${input.bathrooms} − 1) × $${bathIncrement} (5% of suburb base)` });
  }

  // Size (β = 0.5% of base per 10m² above 60m² — size matters less in Zimbabwe rentals)
  if (input.squareMeters) {
    const sizeImpact = Math.round(Math.max(0, (input.squareMeters - 60) / 10) * base * 0.015);
    price += sizeImpact;
    if (sizeImpact > 0) {
      factors.push({ label: `${input.squareMeters}m² floor area`, impact: sizeImpact, positive: true });
      steps.push({ step: "Size premium", value: sizeImpact, note: `${Math.max(0, input.squareMeters - 60)}m² above 60m² baseline × 1.5% of base per 10m²` });
    }
  }

  // Construction quality adjustment (smaller impact — tenants in Zim mostly care about suburb + rooms)
  const cq = CONSTRUCTION_QUALITY[input.houseConstruction ?? "BRICK"] ?? 0.85;
  const constImpact = Math.round((cq - 0.85) * 40); // brick is baseline, max ±$6
  price += constImpact;
  if (constImpact !== 0) {
    factors.push({ label: `${input.houseConstruction ?? "BRICK"} construction`, impact: constImpact, positive: constImpact >= 0 });
    steps.push({ step: "Construction quality", value: constImpact, note: `Quality index ${cq} vs baseline 0.85` });
  }

  // Roof quality
  const rq = ROOF_QUALITY[input.roofType ?? "IRON_SHEETS"] ?? 0.45;
  const roofImpact = Math.round((rq - 0.45) * 30); // iron sheets is baseline, max ~$17
  price += roofImpact;
  if (roofImpact !== 0) {
    factors.push({ label: `${input.roofType ?? "IRON_SHEETS"} roof`, impact: roofImpact, positive: roofImpact >= 0 });
    steps.push({ step: "Roof quality", value: roofImpact, note: `Quality index ${rq} vs baseline 0.45` });
  }

  // Wall condition
  const wallF = CONDITION_FACTOR[input.wallCondition ?? "GOOD"] ?? 0.88;
  const wallImpact = Math.round((wallF - 0.88) * 35);
  price += wallImpact;
  if (wallImpact !== 0) {
    factors.push({ label: `Wall condition: ${input.wallCondition}`, impact: wallImpact, positive: wallImpact >= 0 });
    steps.push({ step: "Wall condition", value: wallImpact, note: `Condition factor ${wallF} vs baseline 0.88` });
  }

  // Window condition
  const winF = CONDITION_FACTOR[input.windowCondition ?? "GOOD"] ?? 0.88;
  const winImpact = Math.round((winF - 0.88) * 20);
  price += winImpact;
  if (winImpact !== 0) {
    factors.push({ label: `Window condition: ${input.windowCondition}`, impact: winImpact, positive: winImpact >= 0 });
    steps.push({ step: "Window condition", value: winImpact, note: `Condition factor ${winF} vs baseline 0.88` });
  }

  // Bathroom type
  const bathroomImpacts: Record<string, number> = { SHOWER_AND_TUB: 10, SHOWER_ONLY: 0, TUB_ONLY: 0, NONE: -15 };
  const bathTypeImpact = bathroomImpacts[input.bathroomType ?? "SHOWER_ONLY"] ?? 0;
  price += bathTypeImpact;
  if (bathTypeImpact !== 0) {
    factors.push({ label: `Bathroom: ${input.bathroomType ?? "SHOWER_ONLY"}`, impact: bathTypeImpact, positive: bathTypeImpact >= 0 });
    steps.push({ step: "Bathroom fittings", value: bathTypeImpact, note: `${input.bathroomType ?? "SHOWER_ONLY"} premium` });
  }

  // Utilities and amenities — impacts are % of suburb base (more realistic for varied suburbs)
  // In Sakubva ($80 base), electricity adds ~$8. In Murambi ($250 base), it adds ~$25.
  const amenities: [boolean | undefined, string, number][] = [
    [input.hasElectricity, "Mains electricity",   0.10],  // 10% of base
    [input.hasWater,       "Running water",        0.08],  // 8%
    [input.hasSecurity,    "Security",             0.07],  // 7%
    [input.hasWifi,        "WiFi connectivity",    0.05],  // 5%
    [input.hasBorehole,    "Borehole water",       0.06],  // 6%
    [input.hasGenerator,   "Generator backup",     0.07],  // 7%
    [input.hasSolarPower,  "Solar power",          0.06],  // 6%
    [input.hasPool,        "Swimming pool",        0.10],  // 10%
    [input.hasDriveway,    "Driveway/parking",     0.04],  // 4%
    [input.hasRefuseCollection, "Refuse collection", 0.03], // 3%
  ];
  for (const [has, label, pct] of amenities) {
    const impact = Math.round(base * pct);
    if (has) {
      price += impact;
      factors.push({ label, impact, positive: true });
    } else if (has === false && (label === "Mains electricity" || label === "Running water")) {
      const penalty = -Math.round(impact * 0.6);
      price += penalty;
      factors.push({ label: `No ${label.toLowerCase()}`, impact: penalty, positive: false });
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
  const effectiveType = input.listingType === "ROOM" ? "ROOM" : input.propertyType;
  const typeM = PROPERTY_TYPE_MULTIPLIER[effectiveType] ?? 1.0;
  let price = base * typeM;
  const factors: PredictionResult["factors"] = [];
  const steps: PredictionStep[] = [
    { step: "Suburb median comp", value: base, note: `Median 2-bed, BRICK, standard house in ${input.suburb}` },
    { step: "After type adjustment", value: Math.round(price), note: `${effectiveType} × ${typeM}` },
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

  // Bedrooms vs baseline of 2 — each extra bed adds ~12% (not 18%, which was too aggressive)
  const bedDiff = input.bedrooms - 2;
  adjust(bedDiff * 0.12, `${input.bedrooms} bedrooms`, `${bedDiff > 0 ? "+" : ""}${bedDiff} bed vs 2-bed comp → ${bedDiff * 12}% adj`);

  // Bathrooms vs baseline of 1 — 6%
  const bathDiff = input.bathrooms - 1;
  adjust(bathDiff * 0.06, `${input.bathrooms} bathrooms`, `${bathDiff > 0 ? "+" : ""}${bathDiff} bath vs 1-bath comp → ${bathDiff * 6}% adj`);

  // Size vs baseline of 70m² — weight reduced to 12%
  if (input.squareMeters) {
    const sizeDiff = (input.squareMeters - 70) / 70;
    adjust(sizeDiff * 0.12, `${input.squareMeters}m² vs 70m² comp`, `Size ratio ${(sizeDiff * 100).toFixed(0)}% → 12% weight`);
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
  const isRoom = input.listingType === "ROOM";
  // For a single room, use a realistic share of the building (~20m²), not the whole structure
  const sqm = isRoom ? 20 : (input.squareMeters ?? 65);
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

  // 7. Amenity value additions ($ capital value — recalibrated)
  const amenityAdditions: [boolean | undefined, string, number][] = [
    [input.hasElectricity, "Mains electricity connection", 2000],
    [input.hasWater, "Reticulated water supply", 1500],
    [input.hasBorehole, "Borehole & pump", 2500],
    [input.hasPool, "Swimming pool", 5000],
    [input.hasGenerator, "Generator installation", 2500],
    [input.hasSolarPower, "Solar PV system", 3000],
    [input.hasSecurity, "Security fencing & gate", 1500],
    [input.hasDriveway, "Paved driveway", 800],
    [input.hasRefuseCollection, "Refuse collection service", 200],
  ];
  let amenityCapital = 0;
  for (const [has, lbl, val] of amenityAdditions) {
    if (has) {
      amenityCapital += val;
      factors.push({ label: lbl, impact: Math.round(val * 0.18 / 12), positive: true });
    }
  }
  if (amenityCapital > 0) steps.push({ step: "Amenity capital additions", value: amenityCapital, note: "Capital cost of installed amenities" });

  // 8. Bathroom fittings capital
  const bathCapital: Record<string, number> = { SHOWER_AND_TUB: 2500, SHOWER_ONLY: 1200, TUB_ONLY: 1000, NONE: 0 };
  const bCap = bathCapital[input.bathroomType ?? "SHOWER_ONLY"] ?? 1200;
  if (bCap > 0) steps.push({ step: "Bathroom fittings capital", value: bCap, note: `${input.bathroomType ?? "SHOWER_ONLY"} fitting value` });

  const totalValue = propertyValue + amenityCapital + bCap;
  steps.push({ step: "Total asset value", value: Math.round(totalValue), note: "Structure + land + amenities + fittings" });

  // 9. Monthly rent via gross rental yield — calibrated to Mutare market (18% p.a.)
  // Zimbabwe rental markets command significantly higher yields than western markets
  // due to low property values relative to market rents.
  const RENTAL_YIELD = 0.18;
  let monthlyRent = (totalValue * RENTAL_YIELD) / 12;

  // Market-anchor blend — suburb median weighted heavily to stay realistic.
  // ROOM listings: 10% cost / 90% median (cost approach poorly suited to shared-space rooms).
  // Other types:   20% cost / 80% median.
  const effectiveTypeCost = input.listingType === "ROOM" ? "ROOM" : input.propertyType;
  const suburbMedian = base * (PROPERTY_TYPE_MULTIPLIER[effectiveTypeCost] ?? 1.0);
  const costWeight = isRoom ? 0.10 : 0.20;
  monthlyRent = monthlyRent * costWeight + suburbMedian * (1 - costWeight);

  // Bedroom adjustment (more bedrooms = more rent even if not more m²)
  // Rooms are locked at 1 bed so no adjustment applies there.
  if (!isRoom) {
    const bedPremium = (input.bedrooms - 2) * 0.08; // +8% per extra bed above 2
    monthlyRent *= (1 + bedPremium);
    if (bedPremium !== 0) {
      const bedImpact = Math.round(monthlyRent - monthlyRent / (1 + bedPremium));
      factors.push({ label: `${input.bedrooms} bedrooms`, impact: bedImpact, positive: bedImpact >= 0 });
      steps.push({ step: "Bedroom yield adjustment", value: bedImpact, note: `(${input.bedrooms} − 2) × 8% bedroom premium` });
    }
  }

  // WiFi is purely rental market (no capital value)
  if (input.hasWifi) {
    monthlyRent += 15;
    factors.push({ label: "WiFi connectivity", impact: 15, positive: true });
  }

  monthlyRent = Math.max(monthlyRent, 50);
  steps.push({ step: "Monthly rent (18% yield ÷ 12, market-blended)", value: Math.round(monthlyRent), note: `Cost-basis 40% + suburb median 60% blend` });

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
