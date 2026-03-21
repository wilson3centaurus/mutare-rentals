/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Shield, Users, Home, TrendingUp, Clock, Mail,
  Activity, Eye, DollarSign, ArrowRight, Loader2, BarChart2,
  CheckCircle2, AlertTriangle, XCircle, GitBranch, Bell,
  BookOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface RequisitionItem {
  id: string;
  suburb: string;
  propertyType: string;
  listingType: string;
  minBedrooms: number | null;
  maxBedrooms: number | null;
  maxBudget: number | null;
  status: string;
  estimatedMin: number | null;
  estimatedMax: number | null;
  createdAt: string;
  user: { name: string; email: string };
}

interface AdminData {
  stats: {
    totalUsers: number;
    totalProperties: number;
    totalPredictions: number;
    totalRequisitions?: number;
  };
  recentUsers: Array<{
    id: string; name: string; email: string; role: string;
    createdAt: string; _count: { properties: number };
  }>;
  users: Array<{
    id: string; name: string; email: string; role: string;
    createdAt: string; _count: { properties: number };
  }>;
  propertiesWithUsers: Array<{
    id: string; title: string; suburb: string; price: number;
    status: string; createdAt: string; bedrooms: number; views: number;
    algorithm: string | null;
    user: { name: string; email: string } | null;
  }>;
  transactions: Array<{
    id: string; listedPrice: number; soldPrice: number | null;
    predictedPrice: number | null; status: string;
    listedAt: string; soldAt: string | null;
    property: { title: string; suburb: string };
    buyer: { name: string } | null;
  }>;
  suburbStats: Array<{
    suburb: string; _count: { id: number }; _avg: { price: number | null };
  }>;
  algorithmStats?: Array<{ algorithm: string | null; _count: { id: number } }>;
  requisitions?: RequisitionItem[];
}

type Tab = "overview" | "users" | "listings" | "transactions" | "requisitions" | "algorithms";

/* ── SVG Bar Chart ── */
function BarChart({ data, color = "emerald" }: {
  data: { label: string; value: number; sub?: string }[];
  color?: "emerald" | "blue" | "purple" | "amber";
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const colors: Record<string, string> = {
    emerald: "#10b981",
    blue: "#3b82f6",
    purple: "#a855f7",
    amber: "#f59e0b",
  };
  const fill = colors[color];
  const H = 120, W = 300, BAR_W = Math.min(28, (W / data.length) - 8);

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ maxHeight: 160 }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <line key={pct} x1={0} y1={H - H * pct} x2={W} y2={H - H * pct}
          stroke="#27272a" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / max) * H);
        const x = (i / data.length) * W + (W / data.length - BAR_W) / 2;
        return (
          <g key={d.label}>
            {/* Bar */}
            <rect x={x} y={H - barH} width={BAR_W} height={barH}
              rx="3" fill={fill} fillOpacity="0.8" />
            {/* Value label */}
            <text x={x + BAR_W / 2} y={H - barH - 4} textAnchor="middle"
              className="fill-zinc-400" fontSize="8" fontFamily="monospace">{d.value}</text>
            {/* X label */}
            <text x={x + BAR_W / 2} y={H + 14} textAnchor="middle"
              className="fill-zinc-500" fontSize="7" fontFamily="sans-serif">
              {d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label}
            </text>
            {d.sub && (
              <text x={x + BAR_W / 2} y={H + 24} textAnchor="middle"
                className="fill-zinc-600" fontSize="6" fontFamily="monospace">{d.sub}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── SVG Donut / Pie Chart ── */
function DonutChart({ segments, size = 120 }: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = 38, cx = size / 2, cy = size / 2;
  const START = -Math.PI / 2;
  const arcs = segments.map((seg, i) => {
    const prevCursor = segments.slice(0, i).reduce((acc, s) => acc + (s.value / total) * 2 * Math.PI, START);
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(prevCursor);
    const y1 = cy + r * Math.sin(prevCursor);
    const x2 = cx + r * Math.cos(prevCursor + angle);
    const y2 = cy + r * Math.sin(prevCursor + angle);
    const large = angle > Math.PI ? 1 : 0;
    return { ...seg, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="flex-shrink-0">
        {arcs.map((arc) => (
          <path key={arc.label} d={arc.d} fill={arc.color} fillOpacity="0.85" stroke="#18181b" strokeWidth="1.5" />
        ))}
        <circle cx={cx} cy={cy} r="20" fill="#18181b" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-zinc-300" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {total}
        </text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: arc.color }} />
              <span className="text-zinc-400">{arc.label}</span>
            </div>
            <span className="font-mono text-zinc-300">{arc.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") { router.push("/login"); return; }
    fetch("/api/admin")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading admin panel…</p>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN" || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Shield className="w-12 h-12 text-red-400/50" />
        <p className="text-zinc-400">Access denied. Admin privileges required.</p>
        <Link href="/login" className="text-emerald-400 text-sm hover:underline">Sign in as admin →</Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "Users", icon: Users },
    { id: "listings", label: "Listings", icon: Home },
    { id: "transactions", label: "Transactions", icon: DollarSign },
    { id: "requisitions", label: "Requisitions", icon: Bell },
    { id: "algorithms", label: "Algorithms", icon: GitBranch },
  ];

  const daysSince = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  /* ── Chart data ── */
  const suburbChartData = data.suburbStats.slice(0, 8).map((s) => ({
    label: s.suburb,
    value: s._count.id,
    sub: formatCurrency(s._avg.price ?? 0),
  }));

  const algoRaw = data.algorithmStats ?? [];
  const algoSegments = [
    { label: "Hedonic", value: algoRaw.find((a) => a.algorithm === "HEDONIC")?._count.id ?? 0, color: "#10b981" },
    { label: "Comp Sales", value: algoRaw.find((a) => a.algorithm === "COMPARABLE_SALES")?._count.id ?? 0, color: "#3b82f6" },
    { label: "Cost Approach", value: algoRaw.find((a) => a.algorithm === "COST_APPROACH")?._count.id ?? 0, color: "#a855f7" },
    { label: "No algorithm", value: algoRaw.find((a) => a.algorithm === null)?._count.id ?? 0, color: "#52525b" },
  ].filter((s) => s.value > 0);

  const statusSegments = [
    { label: "Available", value: data.propertiesWithUsers.filter((p) => p.status === "AVAILABLE").length, color: "#10b981" },
    { label: "Rented", value: data.propertiesWithUsers.filter((p) => p.status === "RENTED").length, color: "#ef4444" },
    { label: "Pending", value: data.propertiesWithUsers.filter((p) => p.status === "PENDING").length, color: "#f59e0b" },
  ].filter((s) => s.value > 0);

  const reqStatusSegments = [
    { label: "Open", value: (data.requisitions ?? []).filter((r) => r.status === "OPEN").length, color: "#3b82f6" },
    { label: "Matched", value: (data.requisitions ?? []).filter((r) => r.status === "MATCHED").length, color: "#10b981" },
    { label: "Closed", value: (data.requisitions ?? []).filter((r) => r.status === "CLOSED").length, color: "#52525b" },
  ].filter((s) => s.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Admin Panel</h1>
          <p className="text-zinc-500 text-sm">System administration &amp; analytics · {session.user.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Users", value: data.stats.totalUsers, icon: <Users className="w-5 h-5 text-blue-400" />, color: "bg-blue-500/10 border-blue-500/20" },
          { label: "Listings", value: data.stats.totalProperties, icon: <Home className="w-5 h-5 text-emerald-400" />, color: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Predictions", value: data.stats.totalPredictions, icon: <GitBranch className="w-5 h-5 text-purple-400" />, color: "bg-purple-500/10 border-purple-500/20" },
          { label: "Transactions", value: data.transactions.length, icon: <DollarSign className="w-5 h-5 text-amber-400" />, color: "bg-amber-500/10 border-amber-500/20" },
          { label: "Requisitions", value: data.stats.totalRequisitions ?? 0, icon: <Bell className="w-5 h-5 text-pink-400" />, color: "bg-pink-500/10 border-pink-500/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.color} border flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
            <p className="text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Suburb bar chart */}
              <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                <h2 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2 text-sm">
                  <BarChart2 className="w-4 h-4 text-emerald-400" /> Listings by Suburb
                </h2>
                <p className="text-xs text-zinc-600 mb-4">Count of properties per suburb · avg price shown below bars</p>
                {suburbChartData.length > 0
                  ? <BarChart data={suburbChartData} color="emerald" />
                  : <p className="text-zinc-600 text-sm text-center py-8">No data yet</p>
                }
              </div>

              {/* Property status donut */}
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 flex flex-col gap-4">
                <div>
                  <h2 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-emerald-400" /> Listing Status
                  </h2>
                  <p className="text-xs text-zinc-600 mb-4">Current availability breakdown</p>
                  <DonutChart segments={statusSegments.length ? statusSegments : [{ label: "None", value: 1, color: "#27272a" }]} />
                </div>
                <div>
                  <h2 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4 text-pink-400" /> Requisitions
                  </h2>
                  <DonutChart segments={reqStatusSegments.length ? reqStatusSegments : [{ label: "None", value: 1, color: "#27272a" }]} />
                </div>
              </div>
            </div>

            {/* Recent registrations */}
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
              <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-emerald-400" /> Recent User Registrations
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {data.recentUsers.length === 0
                  ? <p className="text-zinc-600 text-sm">No users yet</p>
                  : data.recentUsers.slice(0, 6).map((user) => (
                    <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/40 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-400">{user.name[0]?.toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <div className="ml-auto text-right flex-shrink-0">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400" : "bg-zinc-700/60 text-zinc-400"
                        }`}>{user.role}</span>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{daysSince(user.createdAt)}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    {["User", "Email", "Role", "Listings", "Joined"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-zinc-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">{user.name[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-zinc-200 font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">
                        <div className="flex items-center gap-1"><Mail className="w-3 h-3 flex-shrink-0" />{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                        }`}>{user.role}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{user._count.properties}</td>
                      <td className="py-3 px-4 text-zinc-500 text-xs">{daysSince(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {activeTab === "listings" && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    {["Property", "Listed By", "Suburb", "Algorithm", "Price", "Status", "Listed", "Views", ""].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-zinc-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.propertiesWithUsers.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-zinc-200 font-medium truncate max-w-[180px]">{p.title}</p>
                        <p className="text-xs text-zinc-600">{p.bedrooms} bed</p>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{p.user?.name ?? "—"}</td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">{p.suburb}</td>
                      <td className="py-3 px-4">
                        {p.algorithm ? (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            p.algorithm === "HEDONIC" ? "bg-emerald-500/20 text-emerald-400" :
                            p.algorithm === "COMPARABLE_SALES" ? "bg-blue-500/20 text-blue-400" :
                            "bg-purple-500/20 text-purple-400"
                          }`}>{p.algorithm === "COMPARABLE_SALES" ? "COMP" : p.algorithm}</span>
                        ) : <span className="text-zinc-700 text-xs">—</span>}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-medium text-sm">{formatCurrency(p.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          p.status === "RENTED" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>{p.status}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-xs">{daysSince(p.createdAt)}</td>
                      <td className="py-3 px-4 text-zinc-600 text-xs">
                        <div className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/properties/${p.id}`} className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            {data.transactions.length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                No transactions yet.
              </div>
            ) : data.transactions.map((tx) => {
              const priceDiff = tx.predictedPrice && tx.soldPrice
                ? Math.abs(tx.predictedPrice - tx.soldPrice) : null;
              const accuracy = tx.predictedPrice && tx.soldPrice
                ? Math.round((1 - priceDiff! / tx.soldPrice) * 100) : null;
              const isGood = accuracy !== null && accuracy >= 85;
              return (
                <div key={tx.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{tx.property.title}</p>
                      <p className="text-xs text-zinc-500">{tx.property.suburb} · {daysSince(tx.listedAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      tx.status === "SOLD" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      tx.status === "PENDING" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                      "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                    }`}>{tx.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: "Listed Price", val: formatCurrency(tx.listedPrice), c: "text-zinc-200" },
                      { label: "Sold For", val: tx.soldPrice ? formatCurrency(tx.soldPrice) : "—", c: "text-blue-400" },
                      { label: "Algo Predicted", val: tx.predictedPrice ? formatCurrency(tx.predictedPrice) : "—", c: "text-emerald-400" },
                    ].map(({ label, val, c }) => (
                      <div key={label} className="bg-zinc-800/40 rounded-lg p-3 text-center">
                        <p className="text-xs text-zinc-500 mb-1">{label}</p>
                        <p className={`text-sm font-bold ${c}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                  {accuracy !== null && (
                    <div className="flex items-center gap-2">
                      {isGood ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                       accuracy >= 70 ? <AlertTriangle className="w-4 h-4 text-amber-400" /> :
                       <XCircle className="w-4 h-4 text-red-400" />}
                      <span className={`text-xs font-medium ${isGood ? "text-emerald-400" : accuracy >= 70 ? "text-amber-400" : "text-red-400"}`}>
                        Algorithm accuracy: {accuracy}% — {formatCurrency(priceDiff!)} {tx.predictedPrice! > tx.soldPrice! ? "above" : "below"} actual
                      </span>
                    </div>
                  )}
                  {tx.buyer && <p className="text-xs text-zinc-600 mt-2">Rented by: {tx.buyer.name}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── REQUISITIONS ── */}
        {activeTab === "requisitions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-500">
                {(data.requisitions ?? []).length} requisition{(data.requisitions ?? []).length !== 1 ? "s" : ""} submitted by tenants
              </p>
            </div>
            {(data.requisitions ?? []).length === 0 ? (
              <div className="text-center py-12 text-zinc-600">
                <Bell className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                No requisitions yet.
              </div>
            ) : (data.requisitions ?? []).map((req) => (
              <div key={req.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{req.suburb} · {req.propertyType}</p>
                    <p className="text-xs text-zinc-500">
                      {req.listingType === "WHOLE_HOUSE" ? "Whole house" : "Room"} ·{" "}
                      {req.minBedrooms ?? 1}–{req.maxBedrooms ?? "any"} beds ·{" "}
                      Budget: {req.maxBudget ? formatCurrency(req.maxBudget) : "open"}/mo
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">By {req.user.name} ({req.user.email}) · {daysSince(req.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    req.status === "OPEN" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                    req.status === "MATCHED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    "bg-zinc-800 text-zinc-500 border-zinc-700/50"
                  }`}>{req.status}</span>
                </div>
                {(req.estimatedMin || req.estimatedMax) && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-zinc-500">Est. price range:</span>
                    <span className="text-emerald-400 font-mono font-medium">
                      {req.estimatedMin ? formatCurrency(req.estimatedMin) : "?"} – {req.estimatedMax ? formatCurrency(req.estimatedMax) : "?"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ALGORITHMS ── */}
        {activeTab === "algorithms" && (
          <div className="space-y-6">
            {/* Usage chart */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                <h2 className="font-semibold text-zinc-100 mb-1 text-sm flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-emerald-400" /> Algorithm Usage
                </h2>
                <p className="text-xs text-zinc-600 mb-4">How landlords are pricing their listings</p>
                <BarChart
                  data={[
                    { label: "Hedonic", value: algoRaw.find((a) => a.algorithm === "HEDONIC")?._count.id ?? 0 },
                    { label: "Comp Sales", value: algoRaw.find((a) => a.algorithm === "COMPARABLE_SALES")?._count.id ?? 0 },
                    { label: "Cost App.", value: algoRaw.find((a) => a.algorithm === "COST_APPROACH")?._count.id ?? 0 },
                  ]}
                  color="purple"
                />
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                <h2 className="font-semibold text-zinc-100 mb-1 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Distribution
                </h2>
                <p className="text-xs text-zinc-600 mb-4">Share of each algorithm across all listings</p>
                <DonutChart segments={algoSegments.length ? algoSegments : [{ label: "None", value: 1, color: "#27272a" }]} />
              </div>
            </div>

            {/* Algorithm reference */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  id: "HEDONIC", name: "Hedonic Pricing", color: "emerald",
                  formula: "BasePrice + β₁×beds + β₂×baths + β₃×sqm + Σadj",
                  coefficients: [["β₁ (bedroom)", "$65"], ["β₂ (bathroom)", "$35"], ["β₃ (m²)", "$1.50/m²"], ["Age depreciation", "1.5%/yr, max 25%"]],
                  notes: "Best for standard brick houses. Based on Rosen (1974) hedonic regression.",
                },
                {
                  id: "COMPARABLE_SALES", name: "Comparable Sales", color: "blue",
                  formula: "Median × (1 ± 18%×beds) × (1 ± 9%×baths) × (1 ± 20%×size) × ...",
                  coefficients: [["Bedroom adj.", "±18% each"], ["Bathroom adj.", "±9% each"], ["Size adj.", "±20% vs 70m²"], ["Construction adj.", "±0–25%"]],
                  notes: "Closest to estate-agent valuation. Multiplicative adjustments from suburb median.",
                },
                {
                  id: "COST_APPROACH", name: "Cost Approach", color: "purple",
                  formula: "((ReplaceCost × condFactor × ageFactor) + Land + Amenity) × 8.5% ÷ 12",
                  coefficients: [["BRICK", "$360/m²"], ["STONE", "$420/m²"], ["METAL", "$180/m²"], ["Rental yield", "8.5% p.a."]],
                  notes: "Best for new builds. Uses replacement cost + land value converted at market yield.",
                },
              ].map((algo) => (
                <div key={algo.id} className={`bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4`}>
                  <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-3 ${
                    algo.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                    algo.color === "blue" ? "bg-blue-500/10 text-blue-400" :
                    "bg-purple-500/10 text-purple-400"
                  }`}>{algo.name}</div>
                  <p className="font-mono text-[10px] text-zinc-500 bg-zinc-800/50 rounded-lg p-2 mb-3 leading-relaxed">{algo.formula}</p>
                  <div className="space-y-1 mb-3">
                    {algo.coefficients.map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-zinc-500">{label}</span>
                        <span className="font-mono text-zinc-300">{val}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">{algo.notes}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Link href="/algorithms" className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                <BookOpen className="w-4 h-4" /> Full algorithm documentation →
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
