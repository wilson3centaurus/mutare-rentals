import { BookOpen, Target, TrendingUp, Workflow } from "lucide-react";
import Link from "next/link";
import AlgorithmExplorer from "./AlgorithmExplorer";

export default function AlgorithmsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Pricing Algorithms</h1>
        </div>
        <p className="text-zinc-500 text-sm ml-12">
          All rental prices on Mutare Rentals are set algorithmically. Start any model below to reveal how it evaluates a property,
          what it does best, and the charts that explain its pricing behaviour.
        </p>
      </div>

      {/* Price prediction overview */}
      <div className="mb-8 flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
        <div>
          <p className="text-sm font-semibold text-emerald-300 mb-1">House Price Prediction</p>
          <p className="text-xs text-zinc-500 leading-relaxed">
            This system implements three deterministic pricing algorithms calibrated to the Mutare market. The main page now acts like a model explorer:
            pick a pricing method, run it, and inspect the strengths, samples, and graphs only when you need them.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Link href="/predict" className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-all flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Try Price Calculator
            </Link>
            <Link href="/algorithms/best" className="px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-all flex items-center gap-1.5">
              <Workflow className="w-3 h-3" /> Best Algorithm Page
            </Link>
            <Link href="/algorithms/trends" className="px-3 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-all flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Market Trends Page
            </Link>
          </div>
        </div>
      </div>

      <AlgorithmExplorer />

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
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/predict" className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 transition-all">
            Try the Price Calculator →
          </Link>
          <Link href="/algorithms/best" className="px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-all">
            Open Best Algorithm Page →
          </Link>
          <Link href="/algorithms/trends" className="px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 transition-all">
            Open Market Trends Page →
          </Link>
        </div>
      </section>
    </div>
  );
}
