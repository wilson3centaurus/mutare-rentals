import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";
import ModelComparison from "../ModelComparison";

export default function BestAlgorithmPage() {
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
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Best Algorithm</h1>
            <p className="text-sm text-zinc-500">
              Compare all three pricing models side by side using the same property inputs.
            </p>
          </div>
        </div>
      </div>

      <ModelComparison standalone />
    </div>
  );
}