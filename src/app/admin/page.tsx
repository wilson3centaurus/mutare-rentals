"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import {
  Shield, Users, Home, Brain, TrendingUp, Clock, Mail, Phone,
  Activity, Eye, DollarSign, ArrowRight, Loader2, BarChart2,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface AdminData {
  stats: { totalUsers: number; totalProperties: number; totalPredictions: number };
  recentUsers: Array<{
    id: string; name: string; email: string; role: string;
    phone: string | null; createdAt: string; _count: { properties: number };
  }>;
  users: Array<{
    id: string; name: string; email: string; role: string;
    createdAt: string; _count: { properties: number };
  }>;
  propertiesWithUsers: Array<{
    id: string; title: string; suburb: string; price: number;
    status: string; createdAt: string; bedrooms: number; views: number;
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
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "listings" | "transactions">("overview");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

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

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Activity },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "listings" as const, label: "Listings", icon: Home },
    { id: "transactions" as const, label: "Transactions", icon: DollarSign },
  ];

  const daysSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Admin Panel</h1>
          <p className="text-zinc-500 text-sm">System administration & analytics · {session.user.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: data.stats.totalUsers, icon: <Users className="w-5 h-5 text-blue-400" />, color: "bg-blue-500/10 border-blue-500/20" },
          { label: "Total Listings", value: data.stats.totalProperties, icon: <Home className="w-5 h-5 text-emerald-400" />, color: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "AI Predictions", value: data.stats.totalPredictions, icon: <Brain className="w-5 h-5 text-purple-400" />, color: "bg-purple-500/10 border-purple-500/20" },
          { label: "Transactions", value: data.transactions.length, icon: <DollarSign className="w-5 h-5 text-amber-400" />, color: "bg-amber-500/10 border-amber-500/20" },
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
      <div className="flex gap-1 mb-6 bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Suburb Analytics */}
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
              <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Suburb Analytics
              </h2>
              <div className="space-y-3">
                {data.suburbStats.map((s) => {
                  const maxCount = data.suburbStats[0]?._count.id ?? 1;
                  const pct = Math.round((s._count.id / maxCount) * 100);
                  return (
                    <div key={s.suburb}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-zinc-300">{s.suburb}</span>
                        <div className="flex gap-3 text-zinc-500">
                          <span>{s._count.id} listings</span>
                          <span className="text-emerald-400 font-medium">{formatCurrency(s._avg.price ?? 0)} avg</span>
                        </div>
                      </div>
                      <div className="w-full bg-zinc-800/60 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
              <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Recent User Registrations
              </h2>
              <div className="space-y-2">
                {data.recentUsers.length === 0 ? (
                  <p className="text-zinc-600 text-sm">No users yet</p>
                ) : (
                  data.recentUsers.slice(0, 6).map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-400">{user.name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                        }`}>{user.role}</span>
                        <p className="text-xs text-zinc-600 mt-0.5">{daysSince(user.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Listings</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Joined</th>
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
                      <td className="py-3 px-4 text-zinc-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {user.email}
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

        {activeTab === "listings" && (
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Property</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Listed By</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Suburb</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Price</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Listed</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium">Views</th>
                    <th className="text-left py-3 px-4 text-zinc-500 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.propertiesWithUsers.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-zinc-200 font-medium truncate max-w-[200px]">{p.title}</p>
                        <p className="text-xs text-zinc-600">{p.bedrooms} bed</p>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-xs">
                        {p.user ? p.user.name : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{p.suburb}</td>
                      <td className="py-3 px-4 text-emerald-400 font-medium">{formatCurrency(p.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          p.status === "RENTED" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>{p.status}</span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 text-xs">{daysSince(p.createdAt)}</td>
                      <td className="py-3 px-4 text-zinc-600 flex items-center gap-1 text-xs">
                        <Eye className="w-3 h-3" /> {p.views}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/properties/${p.id}`}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
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

        {activeTab === "transactions" && (
          <div className="space-y-6">
            {/* AI vs Actual Price Analysis */}
            <div className="bg-gradient-to-br from-zinc-900/80 to-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6">
              <h2 className="font-semibold text-zinc-100 mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" /> AI Price Accuracy Analysis
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                Comparing AI-predicted prices against actual sold prices to measure model accuracy.
              </p>

              {data.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No transactions yet. Mark a listing as sold to see analytics here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.transactions.map((tx) => {
                    const priceDiff = tx.predictedPrice && tx.soldPrice
                      ? Math.abs(tx.predictedPrice - tx.soldPrice)
                      : null;
                    const accuracy = tx.predictedPrice && tx.soldPrice
                      ? Math.round((1 - priceDiff! / tx.soldPrice) * 100)
                      : null;
                    const isGoodPrediction = accuracy !== null && accuracy >= 85;

                    return (
                      <div key={tx.id} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
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

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-zinc-800/40 rounded-lg p-3 text-center">
                            <p className="text-xs text-zinc-500 mb-1">Listed Price</p>
                            <p className="text-sm font-bold text-zinc-200">{formatCurrency(tx.listedPrice)}</p>
                          </div>
                          <div className="bg-zinc-800/40 rounded-lg p-3 text-center">
                            <p className="text-xs text-zinc-500 mb-1">Sold For</p>
                            <p className="text-sm font-bold text-blue-400">{tx.soldPrice ? formatCurrency(tx.soldPrice) : "—"}</p>
                          </div>
                          <div className="bg-zinc-800/40 rounded-lg p-3 text-center">
                            <p className="text-xs text-zinc-500 mb-1">AI Predicted</p>
                            <p className="text-sm font-bold text-emerald-400">{tx.predictedPrice ? formatCurrency(tx.predictedPrice) : "—"}</p>
                          </div>
                        </div>

                        {accuracy !== null && (
                          <div className="mt-3 flex items-center gap-2">
                            {isGoodPrediction ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : accuracy >= 70 ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-xs font-medium ${
                              isGoodPrediction ? "text-emerald-400" : accuracy >= 70 ? "text-amber-400" : "text-red-400"
                            }`}>
                              AI Accuracy: {accuracy}% — Model was {formatCurrency(priceDiff!)} {tx.predictedPrice! > tx.soldPrice! ? "above" : "below"} actual
                            </span>
                          </div>
                        )}

                        {tx.buyer && (
                          <p className="text-xs text-zinc-600 mt-2">Rented by: {tx.buyer.name}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
