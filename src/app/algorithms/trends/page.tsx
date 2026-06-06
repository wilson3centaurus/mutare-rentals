import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import SuburbTrends from "../SuburbTrends";

export default function MarketTrendsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/algorithms"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Pricing Algorithms
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Market Trends</h1>
            <p className="text-sm text-zinc-500">
              Explore suburb-level rental trends and projected market movement over time.
            </p>
          </div>
        </div>
      </div>

      <SuburbTrends standalone />
    </div>
  );
}