"use client";

import Link from "next/link";
import { MapPin, Brain, Github, Mail, BookOpen, Cpu, Database, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-zinc-800/50 bg-[#08080d] mt-20">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:glow-green transition-all">
                <Brain className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-zinc-100 text-lg">
                Mutare<span className="text-emerald-400">Rentals</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed">
              AI-driven geospatial model for predicting house rental prices in Mutare Province, Zimbabwe.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="mailto:brianngoma@example.com" title="Email" className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" title="GitHub" className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" title="Website" className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Platform</h3>
            <div className="space-y-2.5">
              {[
                { href: "/properties", label: "Browse Listings" },
                { href: "/map", label: "Map View" },
                { href: "/predict", label: "AI Predictor" },
                { href: "/list-property", label: "List Property" },
                { href: "/dashboard", label: "Analytics" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm text-zinc-500 hover:text-emerald-400 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Tech Stack</h3>
            <div className="space-y-2.5">
              {[
                { icon: <Brain className="w-3.5 h-3.5" />, label: "TensorFlow / Scikit-learn" },
                { icon: <Cpu className="w-3.5 h-3.5" />, label: "Next.js / React" },
                { icon: <Database className="w-3.5 h-3.5" />, label: "PostgreSQL (Neon)" },
                { icon: <MapPin className="w-3.5 h-3.5" />, label: "Leaflet.js / GIS" },
                { icon: <Globe className="w-3.5 h-3.5" />, label: "Netlify Cloud" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="text-zinc-600">{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Academic */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Research</h3>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">Dissertation Project</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Brian Ngoma · M22DNX
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Department of Information Systems
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/50 pt-8">
          <div className="text-center space-y-3">
            {/* Academic statement */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-emerald-500/20" />
              <BookOpen className="w-4 h-4 text-emerald-500/40" />
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-emerald-500/20" />
            </div>
            <p className="text-xs text-zinc-400 italic max-w-2xl mx-auto leading-relaxed">
              &ldquo;Submitted in Partial Fulfilment of the Requirements of a Bachelor of Science Honours
              Degree in Information Systems&rdquo;
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-600">
              <span>© {new Date().getFullYear()} MutareRentals</span>
              <span className="hidden sm:inline">·</span>
              <span>Brian Ngoma — M22DNX</span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1">
                Powered by ML
                <Brain className="w-3 h-3 text-emerald-500/50 animate-pulse" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
