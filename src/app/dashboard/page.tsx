import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Home, MapPin, TrendingUp, BarChart2, Activity } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/properties");
  }
  const [
    totalProperties,
    availableProperties,
    rentedProperties,
    avgPriceResult,
    suburbCounts,
    recentProperties,
    totalPredictions,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.property.aggregate({ _avg: { price: true } }),
    prisma.property.groupBy({
      by: ["suburb"],
      _count: { id: true },
      _avg: { price: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.pricePrediction.count(),
  ]);

  const avgPrice = avgPriceResult._avg.price ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Market Dashboard</h1>
        </div>
        <p className="text-zinc-500 mt-1 ml-12">Overview of the Mutare housing rental market</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Listings", value: totalProperties, icon: <Home className="w-5 h-5 text-emerald-400" />, color: "bg-emerald-500/10 border border-emerald-500/20" },
          { label: "Available Now", value: availableProperties, icon: <MapPin className="w-5 h-5 text-blue-400" />, color: "bg-blue-500/10 border border-blue-500/20" },
          { label: "Rented", value: rentedProperties, icon: <BarChart2 className="w-5 h-5 text-purple-400" />, color: "bg-purple-500/10 border border-purple-500/20" },
          { label: "Avg Monthly Rent", value: formatCurrency(avgPrice), icon: <TrendingUp className="w-5 h-5 text-amber-400" />, color: "bg-amber-500/10 border border-amber-500/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Suburb breakdown */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <h2 className="font-semibold text-zinc-100 mb-4">Listings by Suburb</h2>
          <div className="space-y-3">
            {suburbCounts.length === 0 ? (
              <p className="text-zinc-600 text-sm">No data yet</p>
            ) : (
              suburbCounts.map((s: typeof suburbCounts[number]) => {
                const maxCount = suburbCounts[0]._count.id;
                const pct = Math.round((s._count.id / maxCount) * 100);
                return (
                  <div key={s.suburb}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-zinc-300">{s.suburb}</span>
                      <div className="flex items-center gap-3 text-zinc-500">
                        <span>{s._count.id} listings</span>
                        <span className="font-semibold text-emerald-400">{formatCurrency(s._avg.price ?? 0)}/mo avg</span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-800/60 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent listings */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-100">Recent Listings</h2>
            <Link href="/properties" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">View all →</Link>
          </div>
          <div className="space-y-1">
            {recentProperties.length === 0 ? (
              <p className="text-zinc-600 text-sm">No properties listed yet</p>
            ) : (
              (recentProperties as Array<{ id: string; title: string; suburb: string; bedrooms: number; price: number; status: string }>).map((p) => (
                <Link key={p.id} href={`/properties/${p.id}`}>
                  <div className="flex items-center justify-between py-2.5 hover:bg-zinc-800/50 rounded-lg px-2 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{p.title}</p>
                      <p className="text-xs text-zinc-500">{p.suburb} · {p.bedrooms} bed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(p.price)}</p>
                      <p className={`text-xs ${p.status === "AVAILABLE" ? "text-emerald-500" : "text-zinc-600"}`}>
                        {p.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Predictions counter */}
      <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-emerald-400/80 text-sm">Price Calculations Run</p>
            <p className="text-4xl font-bold text-zinc-100 mt-1">{totalPredictions.toLocaleString()}</p>
            <p className="text-emerald-400/60 text-sm mt-1">Algorithmic price estimates generated</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/predict"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 text-center"
            >
              Try the Price Calculator →
            </Link>
            <Link
              href="/algorithms"
              className="bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 text-zinc-300 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors text-center"
            >
              Algorithm Docs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
