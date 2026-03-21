import { BookOpen, BarChart2, TrendingUp, Building2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AlgorithmsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Pricing Algorithms</h1>
        </div>
        <p className="text-zinc-500 text-sm ml-12">
          All rental prices on Mutare Rentals are set algorithmically — never by the landlord — to ensure fair,
          standardised pricing across all listings. Here is how each algorithm works.
        </p>
      </div>

      {/* Algorithm 1 — Hedonic */}
      <section className="mb-8 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Hedonic Pricing Model</h2>
            <p className="text-xs text-zinc-500">Linear regression on individual property attributes</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">Default</span>
        </div>

        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            The <strong className="text-zinc-200">Hedonic Pricing Model</strong> (Rosen, 1974) decomposes a property&apos;s rent into the
            sum of monetary values assigned to each individual attribute. It is the most widely used method in academic
            and government housing research worldwide.
          </p>

          <div className="bg-zinc-800/50 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
            <p className="text-zinc-500 mb-1">{"// The hedonic price equation:"}</p>
            <p>P = BasePrice(suburb) × TypeMultiplier</p>
            <p className="ml-4">+ β₁ × (bedrooms − 1)   {"  // $65 per bedroom"}</p>
            <p className="ml-4">+ β₂ × (bathrooms − 1)  {"  // $35 per bathroom"}</p>
            <p className="ml-4">+ β₃ × max(0, sqm − 50) {"  // $1.50 per m² above 50"}</p>
            <p className="ml-4">+ Σ construction_adj     {"  // ±$0–$80 based on material"}</p>
            <p className="ml-4">+ Σ condition_adj        {"  // ±$0–$84 based on state"}</p>
            <p className="ml-4">+ Σ amenity_contributions{"  // $15–$60 each"}</p>
            <p className="ml-4">− age_depreciation       {"  // 1.5%/yr × price, max 25%"}</p>
          </div>

          <div>
            <p className="font-medium text-zinc-300 mb-2">Suburb base prices (USD/month):</p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[["CBD","$450"],["Greenside","$400"],["Morningside","$380"],["Renishaw","$360"],["Hobhouse","$330"],["Yeovil","$340"],["Chikanga","$270"],["Westlea","$280"],["Fernvalley","$260"],["Dangamvura","$195"],["Sakubva","$160"],["Zimunya","$145"]].map(([s,p]) => (
                <div key={s} className="flex justify-between bg-zinc-800/40 rounded-lg px-2 py-1">
                  <span className="text-zinc-500">{s}</span>
                  <span className="text-zinc-300">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Strengths</p>
              {["Grounded in decades of research","Transparent — each factor explained","Works well for standard properties","Easy to audit and verify"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-zinc-500 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> {s}
                </div>
              ))}
            </div>
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Best used when</p>
              {["Property is standard residential","Suburb base price is well-known","You want a simple, defensible estimate","Limited data on construction costs"].map((s) => (
                <div key={s} className="flex items-start gap-1.5 text-xs text-zinc-500 py-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm 2 — Comparable Sales */}
      <section className="mb-8 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Comparable Sales Analysis</h2>
            <p className="text-xs text-zinc-500">Multiplicative adjustment grid from suburb market comparables</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">Sales Comp</span>
        </div>

        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            The <strong className="text-zinc-200">Comparable Sales Analysis</strong> (Sales Comparison Approach) is the method
            most commonly used by estate agents. It starts from a suburb market median for a standard 2-bedroom brick house,
            then applies multiplicative percentage adjustments for each difference between the subject property and the
            market comp.
          </p>

          <div className="bg-zinc-800/50 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
            <p className="text-zinc-500 mb-1">{"// Multiplicative adjustment grid:"}</p>
            <p>P₀ = SuburbMedian × TypeMultiplier</p>
            <p>P₁ = P₀ × (1 + 0.18 × (beds − 2))    {"  // ±18% per bedroom"}</p>
            <p>P₂ = P₁ × (1 + 0.09 × (baths − 1))   {"  // ±9% per bathroom"}</p>
            <p>P₃ = P₂ × (1 + 0.20 × (sqm−70)/70)   {"  // ±20% for size vs 70m²"}</p>
            <p>P₄ = P₃ × (1 + construction_adj)      {"  // ±0–25%"}</p>
            <p>P₅ = P₄ × (1 + condition_adj)          {"  // ±0–20%"}</p>
            <p>Pₙ = Pₙ₋₁ × (1 + amenity_bundle_score)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Strengths</p>
              {["Reflects how markets actually work","Accounts for compound effects","Closest to estate-agent valuation","Good where comps data is rich"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-zinc-500 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" /> {s}
                </div>
              ))}
            </div>
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Best used when</p>
              {["Property is non-standard","Location has active rental comps","Estimating market positioning","Cross-checking hedonic estimate"].map((s) => (
                <div key={s} className="flex items-start gap-1.5 text-xs text-zinc-500 py-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Algorithm 3 — Cost Approach */}
      <section className="mb-8 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Cost Approach</h2>
            <p className="text-xs text-zinc-500">Replacement cost + land value → rental yield conversion</p>
          </div>
          <span className="ml-auto px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">New Builds</span>
        </div>

        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            The <strong className="text-zinc-200">Cost Approach</strong> (RICS, USPAP) estimates the monthly rent by first computing
            what it would cost to reconstruct the building today, depreciating for age and condition, adding land value,
            then applying a market rental yield to convert to monthly income.
          </p>

          <div className="bg-zinc-800/50 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
            <p className="text-zinc-500 mb-1">{"// Cost Approach formula pipeline:"}</p>
            <p>ReplaceCost = CostPerM²(construction) × floorArea</p>
            <p className="text-zinc-500 mt-1">{"// Construction costs: BRICK=$360/m², STONE=$420/m², METAL=$180/m²"}</p>
            <p className="mt-1">Depreciated  = ReplaceCost × conditionFactor × ageFactor</p>
            <p className="text-zinc-500">{"// ageFactor = max(0.40, 1 − age×0.018)  →  floor 40%"}</p>
            <p className="mt-1">LandValue    = floorArea × $18 × suburbFactor</p>
            <p className="mt-1">TotalValue   = Depreciated + LandValue + amenityCapital</p>
            <p className="mt-1">MonthlyRent  = TotalValue × 0.085 / 12  {"  // 8.5% gross yield"}</p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <p className="col-span-3 font-medium text-zinc-300 mb-0.5">Construction cost per m² (replacement value):</p>
            {[["BRICK","$360"],["STONE","$420"],["MIXED","$290"],["WOOD","$210"],["METAL","$180"]].map(([m,c]) => (
              <div key={m} className="flex justify-between bg-zinc-800/40 rounded-lg px-2 py-1">
                <span className="text-zinc-500">{m}</span><span className="text-zinc-300">{c}/m²</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Strengths</p>
              {["Objective — based on real costs","Excellent for new/modern properties","Accounts for amenity capital value","Independent of market fluctuation"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-zinc-500 py-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /> {s}
                </div>
              ))}
            </div>
            <div>
              <p className="font-medium text-zinc-300 mb-1.5">Best used when</p>
              {["Property is newly built","Floor area (m²) is known precisely","Amenity capital value is significant","Market comps are scarce"].map((s) => (
                <div key={s} className="flex items-start gap-1.5 text-xs text-zinc-500 py-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" /> {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Which to use */}
      <section className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
        <h2 className="font-bold text-zinc-100 mb-4">Which Algorithm Should I Use?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-xs font-medium text-zinc-500 pb-2 pr-4">Scenario</th>
                <th className="text-xs font-medium text-emerald-500/70 pb-2 pr-4">Hedonic</th>
                <th className="text-xs font-medium text-blue-500/70 pb-2 pr-4">Comp Sales</th>
                <th className="text-xs font-medium text-purple-500/70 pb-2">Cost Approach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {[
                ["Standard 2–3 bed brick house","★★★","★★★","★★"],
                ["New construction, know m²","★★","★★","★★★"],
                ["Unusual property type","★","★★★","★★"],
                ["Floor area unknown","★★★","★★","★"],
                ["Older, deteriorated property","★★","★","★★★"],
                ["Premium suburb (Greenside, CBD)","★★★","★★","★★"],
              ].map(([sc, h, cs, ca]) => (
                <tr key={sc} className="text-zinc-400 text-xs">
                  <td className="py-2 pr-4 text-zinc-300">{sc}</td>
                  <td className="py-2 pr-4 text-emerald-400">{h}</td>
                  <td className="py-2 pr-4 text-blue-400">{cs}</td>
                  <td className="py-2 text-purple-400">{ca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href="/predict" className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 transition-all">
            Try the Price Calculator →
          </Link>
          <Link href="/list-property" className="px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-all">
            List a Property →
          </Link>
        </div>
      </section>
    </div>
  );
}
