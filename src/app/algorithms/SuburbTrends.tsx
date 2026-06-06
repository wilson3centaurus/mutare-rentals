"use client";

import { useState } from "react";
import { SUBURB_BASE_PRICES, SUBURBS, formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

// Estimated year-on-year price index relative to the 2026 base.
// Based on Zimbabwe USD rental market dynamics: post-2019 currency reforms,
// USD stabilisation 2021-22, recovery 2023-24, modest growth 2025-2026.
const HISTORY = [
  { year: 2021, factor: 0.68, projected: false },
  { year: 2022, factor: 0.77, projected: false },
  { year: 2023, factor: 0.86, projected: false },
  { year: 2024, factor: 0.93, projected: false },
  { year: 2025, factor: 0.97, projected: false },
  { year: 2026, factor: 1.00, projected: false }, // current
];
const PROJECTED = [
  { year: 2027, factor: 1.05, projected: true },
  { year: 2028, factor: 1.11, projected: true },
];
const ALL_YEARS = [...HISTORY, ...PROJECTED];

const TIER: Record<string, "low-density" | "mid-density" | "high-density"> = {
  Murambi: "low-density", Morningside: "low-density", Fairbridge: "low-density",
  Greenside: "low-density", Hobhouse: "low-density", Renishaw: "low-density",
  Silverstream: "low-density", Yeovil: "low-density",
  CBD: "mid-density", "Christmas Pass": "mid-density", Bvumba: "mid-density",
  Chikanga: "mid-density", Westlea: "mid-density", Fernvalley: "mid-density",
  "Mutasa Park": "mid-density", "Burma Valley": "mid-density", Penhalonga: "mid-density",
  Chisamba: "high-density", Sakubva: "high-density", Dangamvura: "high-density",
  Paulington: "high-density", Zimta: "high-density", Weirmouth: "high-density",
  Zimunya: "high-density",
};
const TIER_INSIGHT = {
  "low-density": "Low-density suburbs historically show stronger price growth, driven by constrained supply and high demand from professionals.",
  "mid-density": "Mid-density suburbs track broad market movements and offer stable rental growth aligned with urban economic conditions.",
  "high-density": "High-density suburbs show steady but moderate growth, anchored primarily to household income capacity and affordability ceilings.",
};
const TIER_COLOR = { "low-density": "#10b981", "mid-density": "#3b82f6", "high-density": "#f59e0b" };

export default function SuburbTrends({ standalone = false }: { standalone?: boolean }) {
  const [suburb, setSuburb] = useState("Murambi");
  const base = SUBURB_BASE_PRICES[suburb] ?? 150;
  const tier = TIER[suburb] ?? "mid-density";
  const color = TIER_COLOR[tier];

  // SVG chart dimensions
  const W = 560, H = 170, PL = 52, PR = 16, PT = 18, PB = 36;
  const innerW = W - PL - PR;
  const innerH = H - PT - PB;
  const maxVal = Math.round(base * 1.20);
  const vals = ALL_YEARS.map((p) => Math.round(base * p.factor));
  const xStep = innerW / (ALL_YEARS.length - 1);
  const yPos = (v: number) => PT + innerH - (v / maxVal) * innerH;

  const histPath = HISTORY.map((p, i) =>
    `${i === 0 ? "M" : "L"}${PL + i * xStep},${yPos(base * p.factor)}`
  ).join(" ");
  const projPath = [HISTORY[HISTORY.length - 1], ...PROJECTED].map((p, i) =>
    `${i === 0 ? "M" : "L"}${PL + (HISTORY.length - 1 + i) * xStep},${yPos(base * p.factor)}`
  ).join(" ");

  const splitX = PL + (HISTORY.length - 1) * xStep;

  return (
    <div id="trends" className={`${standalone ? "" : "mt-6"} bg-zinc-900/60 border border-blue-500/20 rounded-2xl p-6`}>
      <div className="flex items-start gap-3 mb-4">
        <div>
          <h2 className="font-bold text-zinc-100">Market Trends</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Select a suburb to explore rental price trends from 2021 to the current year, plus 2-year projections modelled from algorithmic baselines.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          className="bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
          tier === "low-density" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
          tier === "high-density" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
          "bg-blue-500/10 border-blue-500/20 text-blue-400"
        }`}>{tier}</span>
        <span className="text-sm text-zinc-500">
          2026 base rent: <span className="text-zinc-200 font-semibold">{formatCurrency(base)}/mo</span>
        </span>
      </div>

      {/* SVG Line Chart */}
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 320 }}>
          {/* Grid lines + Y labels */}
          {[0.25, 0.5, 0.75, 1.0].map((pct) => {
            const y = yPos(maxVal * pct);
            return (
              <g key={pct}>
                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#27272a" strokeWidth={1} />
                <text x={PL - 4} y={y + 3.5} fill="#52525b" fontSize={8.5} textAnchor="end">
                  {formatCurrency(Math.round(maxVal * pct))}
                </text>
              </g>
            );
          })}

          {/* Projected zone shading */}
          <rect x={splitX} y={PT} width={W - PR - splitX} height={innerH} fill="#ffffff04" />
          <line x1={splitX} y1={PT} x2={splitX} y2={PT + innerH} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3,3" />
          <text x={splitX + 4} y={PT + 9} fill="#3f3f46" fontSize={7.5}>▶ PROJECTED</text>

          {/* Historical line */}
          <path d={histPath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Projected line (dashed) */}
          <path d={projPath} fill="none" stroke={color} strokeWidth={2} strokeDasharray="5,4" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />

          {/* Data points + labels */}
          {ALL_YEARS.map((p, i) => {
            const cx = PL + i * xStep;
            const cy = yPos(base * p.factor);
            const isCurrent = i === HISTORY.length - 1;
            const isProjected = p.projected;
            const showLabel = isCurrent || isProjected || i === 0;
            return (
              <g key={p.year}>
                {isCurrent && <circle cx={cx} cy={cy} r={9} fill={color} opacity={0.12} />}
                <circle
                  cx={cx} cy={cy}
                  r={isCurrent ? 5 : 3.5}
                  fill={isProjected ? "transparent" : color}
                  stroke={color}
                  strokeWidth={isProjected ? 1.5 : 0}
                  opacity={isProjected ? 0.5 : 1}
                />
                <text x={cx} y={H - PB + 13} fill="#52525b" fontSize={8.5} textAnchor="middle">{p.year}</text>
                {showLabel && (
                  <text
                    x={cx} y={cy - 9}
                    fill={isProjected ? "#52525b" : isCurrent ? "#e4e4e7" : "#71717a"}
                    fontSize={isCurrent ? 9 : 8} textAnchor="middle"
                    fontWeight={isCurrent ? "600" : "400"}
                  >
                    {formatCurrency(Math.round(base * p.factor))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[
          { label: "2021 (baseline)", val: vals[0] },
          { label: "2026 (current)", val: vals[HISTORY.length - 1], highlight: true },
          { label: "2028 (projected)", val: vals[vals.length - 1] },
        ].map(({ label, val, highlight }) => (
          <div key={label} className={`rounded-xl p-3 text-center ${highlight ? "bg-zinc-800/60 border border-zinc-700/40" : "bg-zinc-800/30"}`}>
            <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${highlight ? "text-zinc-100" : "text-zinc-400"}`} style={highlight ? { color } : {}}>
              {formatCurrency(val)}
            </p>
          </div>
        ))}
      </div>

      {/* Growth summary */}
      <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
        <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color }} />
        <span>
          <span className="text-zinc-300 font-medium">{suburb} </span>
          has grown an estimated{" "}
          <span className="font-medium" style={{ color }}>
            {Math.round(((base - Math.round(base * 0.68)) / Math.round(base * 0.68)) * 100)}%
          </span>{" "}
          since 2021 ({formatCurrency(Math.round(base * 0.68))} → {formatCurrency(base)}) and is projected to reach{" "}
          <span className="text-zinc-300">{formatCurrency(Math.round(base * 1.11))}</span> by 2028.{" "}
          {TIER_INSIGHT[tier]}
        </span>
      </div>
      <p className="text-[10px] text-zinc-700 mt-2">
        * Historical values are modelled estimates based on Zimbabwe USD rental market dynamics. Projections assume a ~5–6% p.a. medium-growth scenario. Actual values may vary.
      </p>
    </div>
  );
}
