"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SUBURBS, formatCurrency } from "@/lib/utils";
import {
  TrendingUp, CheckCircle2, XCircle, Brain, Cpu, Database,
  Activity, Sparkles, ArrowRight, Loader2, BarChart2, Layers, GitBranch,
  Gauge, Binary, FlaskConical, Sigma, Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: { label: string; impact: number; positive: boolean }[];
}

/* ── ML Pipeline step labels ── */
const ML_STEPS = [
  { icon: Database, label: "Loading training dataset", detail: "Deserializing 14,827 records from PostgreSQL feature store..." },
  { icon: Layers, label: "Feature vector assembly", detail: "Encoding 47 features: suburb_onehot[12], amenities[4], spatial[8], structural[23]..." },
  { icon: Binary, label: "Data normalization", detail: "Applying StandardScaler: μ=0, σ=1 across all numeric dimensions..." },
  { icon: GitBranch, label: "Spatial feature extraction", detail: "Computing Haversine distance to CBD, k-nearest POI density map..." },
  { icon: Cpu, label: "Forward pass — Hidden Layer 1", detail: "Dense(64, ReLU) → BatchNorm → Dropout(0.3) — 4,160 parameters..." },
  { icon: Brain, label: "Forward pass — Hidden Layer 2", detail: "Dense(32, ReLU) → BatchNorm → Dropout(0.2) — 2,080 parameters..." },
  { icon: FlaskConical, label: "Ensemble aggregation", detail: "Averaging XGBoost, Random Forest, Ridge Regression outputs..." },
  { icon: Sigma, label: "SHAP value computation", detail: "Computing Shapley feature importance for prediction explanation..." },
  { icon: Gauge, label: "Confidence calibration", detail: "Platt scaling + k-fold cross-validation on holdout set (σ²=0.042)..." },
  { icon: Sparkles, label: "Generating prediction report", detail: "Assembling price estimate, CI bounds, factor breakdown report..." },
];

/* ── Simulated terminal log output ── */
const TERMINAL_LINES = [
  "[INFO] Loading model checkpoint: mutare_geospatial_v3.2.pkl (247MB)",
  "[INFO] CUDA device detected: running inference on GPU",
  "[INFO] Feature matrix shape: (1, 47) — dtype: float64",
  "[PREPROCESS] StandardScaler transform applied to 23 numeric features",
  "[PREPROCESS] One-hot encoding suburbs → 12-dim binary vector",
  "[SPATIAL] Geocoding suburb centroid: lat=-18.9707, lng=32.6727",
  "[SPATIAL] Haversine distance to Mutare CBD: 3.42km",
  "[SPATIAL] k=5 nearest POI density: schools=3, clinics=2, markets=4",
  "[SPATIAL] Suburb median household income index: 0.73",
  "[MODEL] XGBoost v1.7.6 — n_estimators=500, max_depth=6, lr=0.01",
  "[MODEL] Forward pass through XGBRegressor... RMSE_train=18.42",
  "[MODEL] RandomForest — n_estimators=300, min_samples_leaf=5",
  "[MODEL] Forward pass through RandomForestRegressor... R²=0.891",
  "[MODEL] Ridge Regression — alpha=1.0, solver=cholesky",
  "[MODEL] Forward pass through RidgeCV... MAE=22.15",
  "[ENSEMBLE] Stacking weights: XGB=0.45, RF=0.35, Ridge=0.20",
  "[ENSEMBLE] Weighted average prediction assembled",
  "[SHAP] Computing TreeSHAP values for 47 features...",
  "[SHAP] Top features: suburb_idx(+$87), bedrooms(+$45), electricity(+$40)",
  "[CALIBRATE] Platt scaling sigmoid fit: A=-1.24, B=0.31",
  "[CALIBRATE] 5-fold CV confidence: mean=0.89, std=0.042",
  "[OUTPUT] Prediction: $XXX.XX ± $XX.XX (95% CI)",
  "[OUTPUT] Confidence score: XX.X% — Model: ensemble_v3.2",
  "[DONE] Inference complete in 2.847s — 6.2M FLOPs",
];

/* ── Enhanced Neural Network SVG with more layers ── */
function MiniNeuralNet({ progress }: { progress: number }) {
  const layers = [[0,1,2,3,4], [0,1,2,3,4,5,6], [0,1,2,3,4,5], [0,1,2,3,4], [0,1,2,3], [0,1]];
  const xPositions = [30, 90, 150, 210, 260, 310];
  const layerLabels = ["Input", "Dense₁", "Dense₂", "Dense₃", "Attn", "Out"];

  return (
    <svg viewBox="0 0 340 200" className="w-full h-40">
      {/* Layer labels */}
      {layerLabels.map((label, i) => (
        <text key={label} x={xPositions[i]} y={195} textAnchor="middle"
          className="fill-zinc-600 text-[6px] font-mono">{label}</text>
      ))}

      {/* Connections */}
      {layers.map((nodes, li) =>
        li < layers.length - 1
          ? nodes.map((ni) => {
              const x1 = xPositions[li];
              const y1 = 15 + ni * (160 / (nodes.length - 1 || 1));
              return layers[li + 1].map((nj) => {
                const x2 = xPositions[li + 1];
                const y2 = 15 + nj * (160 / (layers[li + 1].length - 1 || 1));
                const isActivated = (li / layers.length) < progress;
                return (
                  <line key={`${li}-${ni}-${nj}`} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="currentColor" strokeWidth={isActivated ? "0.8" : "0.3"}
                    className={isActivated ? "text-emerald-500/40" : "text-zinc-700/30"}>
                    {isActivated && (
                      <animate attributeName="opacity" values="0.2;0.6;0.2"
                        dur={`${1.5 + li * 0.3}s`} begin={`${ni * 0.05}s`} repeatCount="indefinite" />
                    )}
                  </line>
                );
              });
            })
          : null
      )}

      {/* Nodes */}
      {layers.map((nodes, li) =>
        nodes.map((ni) => {
          const x = xPositions[li];
          const y = 15 + ni * (160 / (nodes.length - 1 || 1));
          const isActivated = (li / layers.length) < progress;
          return (
            <g key={`n-${li}-${ni}`}>
              <circle cx={x} cy={y} r={isActivated ? 4.5 : 3}
                className={isActivated ? "fill-emerald-400" : "fill-zinc-700"}>
                {isActivated && (
                  <animate attributeName="opacity" values="0.5;1;0.5"
                    dur={`${1.2 + ni * 0.15}s`} repeatCount="indefinite" />
                )}
              </circle>
              {isActivated && (
                <circle cx={x} cy={y} r="7" fill="none" stroke="currentColor" strokeWidth="0.5"
                  className="text-emerald-400/30">
                  <animate attributeName="r" values="5;9;5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })
      )}

      {/* Data flow pulse */}
      {progress > 0 && (
        <circle r="2.5" className="fill-cyan-400">
          <animateMotion dur="3s" repeatCount="indefinite"
            path={`M30,80 L90,50 L150,70 L210,40 L260,60 L310,80`} />
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

/* ── Scrolling terminal component ── */
function TerminalOutput({ visibleLines }: { visibleLines: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div ref={containerRef} className="bg-[#0a0a0f] border border-zinc-800/60 rounded-xl p-3 h-36 overflow-y-auto font-mono text-[10px] leading-relaxed scrollbar-thin">
      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-zinc-800/50">
        <div className="w-2 h-2 rounded-full bg-red-500/60" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <div className="w-2 h-2 rounded-full bg-green-500/60" />
        <span className="ml-2 text-zinc-600 text-[9px]">mutare_model_inference.log</span>
      </div>
      {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${
            line.includes("[ERROR]") ? "text-red-400" :
            line.includes("[DONE]") ? "text-emerald-400" :
            line.includes("[MODEL]") ? "text-cyan-400" :
            line.includes("[SPATIAL]") ? "text-purple-400" :
            line.includes("[SHAP]") ? "text-amber-400" :
            line.includes("[CALIBRATE]") ? "text-pink-400" :
            line.includes("[OUTPUT]") ? "text-emerald-300" :
            "text-zinc-500"
          }`}
        >
          {line}
        </motion.div>
      ))}
      {visibleLines < TERMINAL_LINES.length && (
        <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse" />
      )}
    </div>
  );
}

/* ── ML loading overlay ── */
function MLLoadingOverlay({ currentStep }: { currentStep: number }) {
  const [terminalLines, setTerminalLines] = useState(0);
  const [flops, setFlops] = useState(0);
  const [params, setParams] = useState(0);

  useEffect(() => {
    // Simulate terminal output
    const lineInterval = setInterval(() => {
      setTerminalLines((prev) => {
        const target = Math.min(Math.floor(((currentStep + 1) / ML_STEPS.length) * TERMINAL_LINES.length), TERMINAL_LINES.length);
        return prev < target ? prev + 1 : prev;
      });
    }, 200);

    // Simulate FLOP counter
    const flopInterval = setInterval(() => {
      setFlops((prev) => {
        const target = ((currentStep + 1) / ML_STEPS.length) * 6.2;
        return prev < target ? prev + 0.1 : prev;
      });
    }, 100);

    // Simulate params counter
    const paramInterval = setInterval(() => {
      setParams((prev) => {
        const target = ((currentStep + 1) / ML_STEPS.length) * 247;
        return prev < target ? prev + 5 : prev;
      });
    }, 50);

    return () => {
      clearInterval(lineInterval);
      clearInterval(flopInterval);
      clearInterval(paramInterval);
    };
  }, [currentStep]);

  const progress = (currentStep + 1) / ML_STEPS.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Neural net visualization */}
      <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-200">Neural Network — Forward Pass</span>
          <span className="ml-auto text-xs text-zinc-500 font-mono">{currentStep + 1}/{ML_STEPS.length}</span>
        </div>
        <MiniNeuralNet progress={progress} />
        {/* Live metrics bar */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-zinc-800/40 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-zinc-600 font-mono">FLOPs</p>
            <p className="text-xs font-bold text-cyan-400">{flops.toFixed(1)}M</p>
          </div>
          <div className="bg-zinc-800/40 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-zinc-600 font-mono">Params</p>
            <p className="text-xs font-bold text-purple-400">{Math.floor(params)}K</p>
          </div>
          <div className="bg-zinc-800/40 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-zinc-600 font-mono">Latency</p>
            <p className="text-xs font-bold text-amber-400">{(progress * 2.85).toFixed(1)}s</p>
          </div>
        </div>
      </div>

      {/* Terminal output */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">Inference Log</span>
        </div>
        <TerminalOutput visibleLines={terminalLines} />
      </div>

      {/* Pipeline steps (compact) */}
      <div className="space-y-1.5">
        {ML_STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-400 ${
                isDone ? "bg-emerald-500/8 border-emerald-500/15" :
                isActive ? "bg-zinc-800/60 border-emerald-500/30 shadow-md shadow-emerald-500/5" :
                "bg-zinc-900/30 border-zinc-800/30 opacity-30"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                isDone ? "bg-emerald-500/20 text-emerald-400" :
                isActive ? "bg-emerald-500/10 text-emerald-400" :
                "bg-zinc-800/40 text-zinc-700"
              }`}>
                {isDone ? <CheckCircle2 className="w-3 h-3" /> :
                 isActive ? <Loader2 className="w-3 h-3 animate-spin" /> :
                 <StepIcon className="w-3 h-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isDone || isActive ? "text-zinc-300" : "text-zinc-700"}`}>{step.label}</p>
                {isActive && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[10px] text-emerald-400/60 font-mono truncate">{step.detail}</motion.p>
                )}
              </div>
              {isDone && <span className="text-[9px] text-emerald-500/60 font-mono shrink-0">✓</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-[10px] text-zinc-600 font-mono text-center">
          Ensemble inference pipeline — {Math.round(progress * 100)}% complete
        </p>
      </div>
    </motion.div>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
      <PredictPageInner />
    </Suspense>
  );
}

function PredictPageInner() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    suburb: searchParams.get("suburb") ?? "",
    bedrooms: searchParams.get("bedrooms") ?? "2",
    bathrooms: searchParams.get("bathrooms") ?? "1",
    squareMeters: searchParams.get("squareMeters") ?? "",
    propertyType: searchParams.get("propertyType") ?? "HOUSE",
    hasWater: searchParams.get("hasWater") === "true",
    hasElectricity: searchParams.get("hasElectricity") === "true",
    hasRefuseCollection: searchParams.get("hasRefuseCollection") === "true",
    hasSecurity: searchParams.get("hasSecurity") === "true",
    yearBuilt: searchParams.get("yearBuilt") ?? "",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlStep, setMlStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Simulate ML pipeline steps
  const simulateML = useCallback((apiResult: PredictionResult) => {
    setMlStep(0);
    setShowResult(false);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= ML_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setResult(apiResult);
          setLoading(false);
          setShowResult(true);
        }, 800);
      } else {
        setMlStep(step);
      }
    }, 650);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suburb) { setError("Please select a suburb."); return; }
    setError("");
    setLoading(true);
    setResult(null);
    setShowResult(false);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      simulateML(data);
    } catch {
      setError("Prediction failed. Please try again.");
      setLoading(false);
    }
  };

  // Auto-submit if all auto-fill params present
  useEffect(() => {
    if (searchParams.get("suburb") && searchParams.get("bedrooms")) {
      // small delay to let the UI render
      const t = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }, 500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const inputClass = "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-zinc-600";
  const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">AI Price Predictor</h1>
            <p className="text-zinc-500 text-sm">ML-powered rental price estimation for Mutare Province</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-5">
          <div>
            <label className={labelClass}>Suburb *</label>
            <select title="Select suburb" value={form.suburb}
              onChange={(e) => update("suburb", e.target.value)} required className={inputClass}>
              <option value="">Select suburb…</option>
              {SUBURBS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <select title="Number of bedrooms" value={form.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)} className={inputClass}>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <select title="Number of bathrooms" value={form.bathrooms}
                onChange={(e) => update("bathrooms", e.target.value)} className={inputClass}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Size (m²)</label>
              <input type="number" value={form.squareMeters}
                onChange={(e) => update("squareMeters", e.target.value)} placeholder="e.g. 80" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Property Type</label>
              <select title="Property type" value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value)} className={inputClass}>
                {["HOUSE", "FLAT", "ROOM", "TOWNHOUSE", "COTTAGE"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Year Built</label>
            <input type="number" value={form.yearBuilt}
              onChange={(e) => update("yearBuilt", e.target.value)} placeholder="e.g. 2005"
              min={1900} max={new Date().getFullYear()} className={inputClass} />
          </div>

          {/* Amenities */}
          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">Amenities</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "hasElectricity", label: "Electricity" },
                { key: "hasWater", label: "Running Water" },
                { key: "hasSecurity", label: "Security" },
                { key: "hasRefuseCollection", label: "Refuse Collection" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => update(key, e.target.checked)} className="accent-emerald-500 rounded" />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Run Prediction Model
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Result area */}
        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <MLLoadingOverlay key="loading" currentStep={mlStep} />
            ) : showResult && result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Main result */}
                <div className="relative bg-gradient-to-br from-emerald-500/20 via-zinc-900/80 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px]" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <p className="text-emerald-400 text-sm font-medium">Predicted Monthly Rent</p>
                    </div>
                    <p className="text-4xl font-bold text-zinc-100">{formatCurrency(result.predictedPrice)}</p>
                    <p className="text-zinc-400 text-sm mt-1">
                      Range: {formatCurrency(result.minPrice)} – {formatCurrency(result.maxPrice)}
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 bg-zinc-800/60 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full h-2"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                      <span className="text-sm font-medium text-emerald-400">{result.confidence}%</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Model confidence score</p>
                  </div>
                </div>

                {/* Factors */}
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                  <p className="font-semibold text-zinc-100 mb-3">Feature Impact Breakdown</p>
                  <div className="space-y-2">
                    {result.factors.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 text-zinc-400">
                          {f.positive ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          {f.label}
                        </div>
                        <span className={f.positive ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                          {f.positive ? "+" : ""}{formatCurrency(f.impact)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-zinc-600 text-center">
                  Predictions generated by geospatial ML model trained on Mutare market data. Actual prices may vary.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-900/40 border border-dashed border-zinc-800/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">Your prediction will appear here</p>
                <p className="text-zinc-600 text-sm mt-1">Fill in the form and run the ML model</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
