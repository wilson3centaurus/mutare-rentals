"use client";

import { useState } from "react";
import {
  ArrowRight,
  BarChart2,
  Building2,
  CheckCircle2,
  Loader2,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import { ComparableSalesCharts, CostApproachCharts, HedonicCharts } from "./AlgorithmCharts";

type ChartComponent = () => React.JSX.Element;

type ModelCard = {
  id: "hedonic" | "comparable" | "cost";
  title: string;
  badge: string;
  summary: string;
  intro: string;
  steps: string[];
  strengths: string[];
  bestFor: string[];
  samples: Array<[string, string]>;
  button: string;
  color: {
    bg: string;
    border: string;
    text: string;
    soft: string;
  };
  Icon: typeof BarChart2;
  Chart: ChartComponent;
};

const MODELS: ModelCard[] = [
  {
    id: "hedonic",
    title: "Hedonic Pricing Model",
    badge: "Default",
    summary: "Breaks rent into suburb, bedroom, bathroom, condition, and amenity value.",
    intro:
      "This model starts from a suburb baseline and then adds or subtracts value for each property feature. It is the easiest model to explain and defend because every input has a clear contribution.",
    steps: [
      "Starts with the suburb base rent and property type multiplier.",
      "Adds bedroom, bathroom, size, and condition adjustments.",
      "Applies amenity premiums and age-related depreciation.",
    ],
    strengths: [
      "Very transparent and easy to audit.",
      "Works well for standard houses and flats.",
      "Good when suburb baselines are already well calibrated.",
      "Strong fit for academic explanation and reporting.",
    ],
    bestFor: [
      "Normal residential listings.",
      "Quick, defensible rental estimates.",
      "Cases where users want to understand why a price changed.",
      "Mutare suburbs with stable observed rent patterns.",
    ],
    samples: [
      ["Murambi · 3-bed house", "$570"],
      ["Chikanga · 2-bed house", "$302"],
      ["Dangamvura · single room", "$59"],
    ],
    button: "Run Hedonic Model",
    color: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      soft: "bg-emerald-500/5",
    },
    Icon: BarChart2,
    Chart: HedonicCharts,
  },
  {
    id: "comparable",
    title: "Comparable Sales Analysis",
    badge: "Sales Comp",
    summary: "Matches the property against suburb market comparables and applies adjustment percentages.",
    intro:
      "This model behaves most like a valuer or estate agent. It starts with a standard comparable in the same suburb and then adjusts up or down based on how the subject property differs from that benchmark.",
    steps: [
      "Begins from the suburb median for a standard 2-bed house.",
      "Applies percentage adjustments for bedrooms, bathrooms, size, and build quality.",
      "Finishes with bundled amenity and condition adjustments.",
    ],
    strengths: [
      "Closest to estate-agent thinking.",
      "Reflects market positioning clearly.",
      "Useful for non-standard or premium listings.",
      "Strong cross-check against hedonic output.",
    ],
    bestFor: [
      "Listings in active rental suburbs.",
      "Comparing one property against market peers.",
      "Demonstrating relative overpricing or underpricing.",
      "Supervisor demos where side-by-side market logic matters.",
    ],
    samples: [
      ["Morningside · 3-bed house", "$560"],
      ["Hobhouse · 2-bed house", "$302"],
      ["Sakubva · single room", "$54"],
    ],
    button: "Run Comparable Model",
    color: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      text: "text-blue-400",
      soft: "bg-blue-500/5",
    },
    Icon: TrendingUp,
    Chart: ComparableSalesCharts,
  },
  {
    id: "cost",
    title: "Cost Approach",
    badge: "New Builds",
    summary: "Reconstructs the property value from construction cost, land value, and rental yield.",
    intro:
      "This model estimates what the structure is worth today, adjusts for age and condition, then converts that value into a rental figure. It is strongest for newer or well-described properties where build details are known.",
    steps: [
      "Calculates replacement cost from floor area and construction materials.",
      "Adjusts for roof quality, condition, age, and land component.",
      "Converts the asset value into rent and anchors it back to suburb reality.",
    ],
    strengths: [
      "Useful where construction details are known precisely.",
      "Good for newer houses and recently upgraded properties.",
      "Captures the value of capital-intensive amenities.",
      "Provides a structural cross-check against market-only methods.",
    ],
    bestFor: [
      "New builds or recently renovated houses.",
      "Cases with reliable square-metre data.",
      "Properties with notable solar, borehole, or pool investment.",
      "Validating whether market rent still tracks replacement value.",
    ],
    samples: [
      ["Darlington · 3-bed house", "$570"],
      ["Paulington · 2-bed house", "$230"],
      ["Murambi · single room", "$112"],
    ],
    button: "Run Cost Model",
    color: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      text: "text-purple-400",
      soft: "bg-purple-500/5",
    },
    Icon: Building2,
    Chart: CostApproachCharts,
  },
];

const RUN_STEPS = [
  "Loading suburb baseline…",
  "Evaluating property features…",
  "Preparing model breakdown…",
];

export default function AlgorithmExplorer() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [runningId, setRunningId] = useState<string | null>(null);

  const runModel = (id: ModelCard["id"]) => {
    setRunningId(id);
    window.setTimeout(() => {
      setRevealed((current) => ({ ...current, [id]: true }));
      setRunningId((current) => (current === id ? null : current));
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {MODELS.map((model) => {
        const Icon = model.Icon;
        const Chart = model.Chart;
        const isRunning = runningId === model.id;
        const isRevealed = Boolean(revealed[model.id]);

        return (
          <section
            key={model.id}
            className={`rounded-2xl border ${model.color.border} ${model.color.soft} p-6`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${model.color.bg} border ${model.color.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${model.color.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-zinc-100">{model.title}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${model.color.bg} ${model.color.text} border ${model.color.border}`}>
                      {model.badge}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1 max-w-2xl">{model.summary}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runModel(model.id)}
                disabled={isRunning}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-70 min-w-[190px] ${model.color.bg} ${model.color.text} ${model.color.border}`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Evaluating…
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" /> {isRevealed ? "Run Again" : model.button}
                  </>
                )}
              </button>
            </div>

            {!isRevealed && (
              <div className="mt-5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4">
                {isRunning ? (
                  <div className="space-y-2">
                    {RUN_STEPS.map((step) => (
                      <div key={step} className="flex items-center gap-2 text-sm text-zinc-400">
                        <Loader2 className={`w-3.5 h-3.5 animate-spin ${model.color.text}`} />
                        {step}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Start the model to reveal its method, strengths, sample outputs, and charts.
                  </p>
                )}
              </div>
            )}

            {isRevealed && (
              <div className="mt-5 pt-5 border-t border-zinc-800/60 space-y-5">
                <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        What It Does
                      </p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{model.intro}</p>
                    </div>

                    <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        Evaluation Flow
                      </p>
                      <div className="space-y-2">
                        {model.steps.map((step) => (
                          <div key={step} className="flex items-start gap-2 text-sm text-zinc-400">
                            <ArrowRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${model.color.text}`} />
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Sample Outputs
                    </p>
                    <div className="space-y-2.5">
                      {model.samples.map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between text-sm rounded-lg bg-zinc-900/60 px-3 py-2">
                          <span className="text-zinc-400">{label}</span>
                          <span className={`font-semibold ${model.color.text}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Strengths
                    </p>
                    <div className="space-y-2">
                      {model.strengths.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${model.color.text}`} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                      Best Used When
                    </p>
                    <div className="space-y-2">
                      {model.bestFor.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                          <ArrowRight className={`w-4 h-4 mt-0.5 shrink-0 ${model.color.text}`} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Chart />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}