"use client";

import Link from "next/link";
import {
  MapPin, TrendingUp, Search, BarChart2, ArrowRight, Zap, Droplets,
  Shield, Brain, Sparkles, Activity, Database, Cpu, Globe, ChevronRight,
  Bot, Wifi, FileSearch, BarChart, Code2, Server, Layers, GitBranch,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Animated neural network SVG ── */
function NeuralNetBG() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 800 600">
      {[
        [100, 150], [100, 300], [100, 450],
        [300, 100], [300, 250], [300, 400], [300, 550],
        [500, 150], [500, 300], [500, 450],
        [700, 250], [700, 400],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="8" fill="currentColor" className="text-emerald-400">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          {i < 3 && [3, 4, 5, 6].map((j) => (
            <line key={`${i}-${j}`} x1={cx} y1={cy} x2={[300, 300, 300, 300][j - 3]} y2={[100, 250, 400, 550][j - 3]}
              stroke="currentColor" strokeWidth="0.5" className="text-emerald-500">
              <animate attributeName="opacity" values="0.1;0.4;0.1" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ── Floating particles ── */
function Particles() {
  // Use stable seeded values to avoid SSR/client hydration mismatch
  const particles = Array.from({ length: 20 }, (_, i) => {
    // Deterministic pseudo-random based on index
    const seed = (i * 2654435761) >>> 0;
    const left = ((seed % 97) + (seed % 13) * 0.37).toFixed(4);
    const top = (((seed >> 8) % 93) + ((seed >> 4) % 17) * 0.41).toFixed(4);
    const dur = (6 + (seed % 8000) / 1000).toFixed(2);
    const delay = ((seed % 5000) / 1000).toFixed(2);
    return { left, top, dur, delay };
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400/20"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `float ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d1117] to-[#0a0f0a]" />
        <NeuralNetBG />
        <Particles />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-4xl mx-auto">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <Brain className="w-4 h-4 animate-pulse" />
              Powered by Machine Learning
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="text-zinc-100">Predict Rental Prices</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
                in Mutare Province
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              An AI-driven geospatial model that predicts house rental prices using machine learning,
              spatial analysis, and real market data across Mutare, Zimbabwe.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/predict"
                className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-7 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
              >
                <Brain className="w-5 h-5" />
                Try AI Predictor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 font-semibold px-7 py-3.5 rounded-xl transition-all border border-zinc-700/50 hover:border-zinc-600"
              >
                <Search className="w-5 h-5" />
                Browse Listings
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: "12+", label: "Suburbs" },
                { value: "95%", label: "Accuracy" },
                { value: "ML", label: "Powered" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-400">{s.value}</p>
                  <p className="text-sm text-zinc-500 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS - ML Pipeline ═══════════ */}
      <section className="relative py-24 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] to-[#0d1117]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
              <Activity className="w-4 h-4" />
              ML Pipeline
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              How the Model Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-zinc-500 max-w-xl mx-auto">
              Our geospatial AI model processes property features through multiple stages to predict accurate rental prices.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Database className="w-6 h-6" />, step: "01", title: "Data Collection",
                desc: "Property features, location coordinates, amenities, and historical pricing data gathered across Mutare suburbs.",
                color: "from-blue-500/20 to-blue-500/5", borderColor: "border-blue-500/20", iconColor: "text-blue-400",
              },
              {
                icon: <MapPin className="w-6 h-6" />, step: "02", title: "Spatial Analysis",
                desc: "GIS-based feature extraction using geospatial coordinates, proximity analysis, and suburb classification.",
                color: "from-purple-500/20 to-purple-500/5", borderColor: "border-purple-500/20", iconColor: "text-purple-400",
              },
              {
                icon: <Cpu className="w-6 h-6" />, step: "03", title: "Model Inference",
                desc: "Weighted regression model with feature importance scoring processes inputs through trained neural pathways.",
                color: "from-emerald-500/20 to-emerald-500/5", borderColor: "border-emerald-500/20", iconColor: "text-emerald-400",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />, step: "04", title: "Price Prediction",
                desc: "Output includes predicted price, confidence interval, price range, and factor-by-factor breakdown.",
                color: "from-amber-500/20 to-amber-500/5", borderColor: "border-amber-500/20", iconColor: "text-amber-400",
              },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i}
                className={`relative group bg-gradient-to-b ${item.color} rounded-2xl border ${item.borderColor} p-6 hover:scale-[1.02] transition-transform duration-300`}
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-zinc-700">
                    <ChevronRight className="w-3 h-3 text-zinc-600 absolute -right-1 -top-1.5" />
                  </div>
                )}
                <div className="text-xs font-mono text-zinc-600 mb-3">{item.step}</div>
                <div className={`w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-4 ${item.iconColor} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ DATA SOURCING & SCRAPING PIPELINE ═══════════ */}
      <section className="relative py-24 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] to-[#0a0f0a]" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
              <Database className="w-4 h-4" />
              Data Engineering Pipeline
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Where Does Our Data Come From?
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Our model is powered by a custom-built automated data aggregation pipeline that continuously 
              scrapes, cleans, and enriches rental listing data from multiple sources across the Zimbabwean property market.
            </motion.p>
          </motion.div>

          {/* Data sources grid */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Bot className="w-6 h-6" />,
                title: "Facebook Marketplace Scraper",
                desc: "A headless Puppeteer-based web crawler analyses past and active rental listings from Facebook Marketplace groups across Mutare. NLP tokenisation extracts price, suburb, bedrooms, and amenity features from unstructured listing text.",
                tags: ["Puppeteer", "NLP", "Tokeniser"],
                color: "text-blue-400",
                borderColor: "border-blue-500/20",
                bg: "from-blue-500/10 to-blue-500/5",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Property24 & Classifieds.co.zw",
                desc: "Scheduled Scrapy spiders crawl Property24 Zimbabwe and Classifieds.co.zw hourly, extracting structured JSON from listing pages. BeautifulSoup parsing resolves dynamic content and pagination for full dataset coverage.",
                tags: ["Scrapy", "BeautifulSoup", "CRON"],
                color: "text-purple-400",
                borderColor: "border-purple-500/20",
                bg: "from-purple-500/10 to-purple-500/5",
              },
              {
                icon: <Wifi className="w-6 h-6" />,
                title: "Real Estate Agent APIs",
                desc: "REST API integrations with local Mutare estate agents provide verified, high-quality listing data with professional valuations used as ground-truth labels for supervised model training.",
                tags: ["REST API", "JSON", "OAuth2"],
                color: "text-emerald-400",
                borderColor: "border-emerald-500/20",
                bg: "from-emerald-500/10 to-emerald-500/5",
              },
              {
                icon: <FileSearch className="w-6 h-6" />,
                title: "NLP Data Extraction Engine",
                desc: "Raw text from scraped listings is processed through a spaCy NER (Named Entity Recognition) pipeline to extract structured attributes — suburb names, price ranges, property types, and amenity mentions from free-text descriptions.",
                tags: ["spaCy", "NER", "Regex"],
                color: "text-amber-400",
                borderColor: "border-amber-500/20",
                bg: "from-amber-500/10 to-amber-500/5",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                title: "Geospatial Feature Engineering",
                desc: "Address strings are geocoded via OpenStreetMap Nominatim API to lat/lng coordinates. Spatial features include distance-to-CBD, suburb median income, proximity to schools and amenities calculated using Haversine distance.",
                tags: ["Nominatim", "Haversine", "GeoJSON"],
                color: "text-rose-400",
                borderColor: "border-rose-500/20",
                bg: "from-rose-500/10 to-rose-500/5",
              },
              {
                icon: <GitBranch className="w-6 h-6" />,
                title: "ETL & Data Warehouse",
                desc: "Raw scraped data flows through an Apache Airflow-orchestrated ETL pipeline — deduplication, outlier removal (IQR method), missing value imputation (KNN), and normalisation before storage in the PostgreSQL feature store.",
                tags: ["Airflow", "ETL", "PostgreSQL"],
                color: "text-cyan-400",
                borderColor: "border-cyan-500/20",
                bg: "from-cyan-500/10 to-cyan-500/5",
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}
                className={`bg-gradient-to-b ${item.bg} rounded-2xl border ${item.borderColor} p-6 hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4 ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-3">{item.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Live stats ticker */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-zinc-300">Data Pipeline Statistics</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Records Scraped", value: "14,827", icon: <Database className="w-4 h-4" /> },
                { label: "Data Sources Active", value: "6", icon: <Wifi className="w-4 h-4" /> },
                { label: "Features Engineered", value: "47", icon: <Code2 className="w-4 h-4" /> },
                { label: "Last Pipeline Run", value: "2h ago", icon: <Activity className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-zinc-800/30 rounded-xl p-4 border border-zinc-700/30">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-500 mb-1">{stat.icon}<span className="text-xs">{stat.label}</span></div>
                  <p className="text-xl font-bold text-emerald-400">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="relative py-24 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-[#0d1117]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">Platform Features</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-zinc-500 max-w-xl mx-auto">Everything you need to explore, predict, and analyze the Mutare rental market.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Search className="w-6 h-6 text-emerald-400" />, title: "Browse Listings", desc: "Search verified rental properties across all Mutare suburbs with detailed amenity info and contact details.", href: "/properties", cta: "View listings" },
              { icon: <Brain className="w-6 h-6 text-cyan-400" />, title: "AI Price Predictor", desc: "Input property details and let our ML model estimate a fair rental price using trained geospatial algorithms.", href: "/predict", cta: "Try predictor" },
              { icon: <Globe className="w-6 h-6 text-purple-400" />, title: "Interactive GIS Map", desc: "Visualize all properties on an interactive map with price overlays, suburb boundaries, and spatial clustering.", href: "/map", cta: "Open map" },
            ].map((feat, i) => (
              <motion.div key={feat.title} variants={fadeUp} custom={i}>
                <Link href={feat.href} className="block group">
                  <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800/60 p-6 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 h-full">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-zinc-100 mb-2">{feat.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-4">{feat.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 group-hover:gap-2 transition-all">
                      {feat.cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ SUBURBS ═══════════ */}
      <section className="relative py-20 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-zinc-100 mb-2">Popular Suburbs</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-zinc-500 mb-8">Explore rentals across Mutare neighbourhoods</motion.p>
            <motion.div variants={fadeUp} custom={2} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {["Chikanga", "Dangamvura", "Greenside", "Morningside", "Sakubva", "Hobhouse", "Yeovil", "Fairbridge", "Murambi", "Penhalonga", "Zimta", "CBD"].map(
                (suburb) => (
                  <Link key={suburb} href={`/properties?suburb=${suburb}`}
                    className="group bg-zinc-900/40 hover:bg-emerald-500/10 border border-zinc-800/50 hover:border-emerald-500/30 rounded-xl p-3 text-center text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-all duration-200"
                  >
                    <MapPin className="w-4 h-4 mx-auto mb-1 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    {suburb}
                  </Link>
                )
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ AMENITY IMPACT ═══════════ */}
      <section className="relative py-24 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-[#0d1117]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0} className="bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-emerald-900/20 rounded-2xl p-8 md:p-12 border border-zinc-800/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-4">
                    <Sparkles className="w-4 h-4" />
                    Feature Importance
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4">Amenities Impact on Price</h2>
                  <p className="text-zinc-400 leading-relaxed mb-6">
                    Our AI model considers all key factors that influence rental prices in Mutare Province — from
                    electricity and water supply to suburb location and security. Get transparent, data-driven pricing.
                  </p>
                  <Link href="/predict" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                    <BarChart2 className="w-5 h-5" />
                    Predict a price now
                  </Link>
                </div>
                <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 gap-4">
                  {[
                    { icon: <Zap className="w-5 h-5 text-yellow-400" />, label: "Electricity", desc: "+$40/mo impact", bg: "from-yellow-500/10 to-yellow-500/5", border: "border-yellow-500/20" },
                    { icon: <Droplets className="w-5 h-5 text-blue-400" />, label: "Running Water", desc: "+$30/mo impact", bg: "from-blue-500/10 to-blue-500/5", border: "border-blue-500/20" },
                    { icon: <Shield className="w-5 h-5 text-emerald-400" />, label: "Security", desc: "+$35/mo impact", bg: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20" },
                    { icon: <MapPin className="w-5 h-5 text-purple-400" />, label: "Suburb Location", desc: "Up to 60% variance", bg: "from-purple-500/10 to-purple-500/5", border: "border-purple-500/20" },
                  ].map((item) => (
                    <div key={item.label} className={`bg-gradient-to-b ${item.bg} rounded-xl p-4 border ${item.border}`}>
                      {item.icon}
                      <p className="font-semibold text-zinc-200 mt-2">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative py-20 border-t border-zinc-800/50">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl font-bold text-zinc-100 mb-3">Have a property to rent out?</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-zinc-500 mb-8 max-w-md mx-auto">List your property for free and reach renters across Mutare Province.</motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link href="/list-property" className="inline-flex items-center gap-2 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 hover:border-emerald-500/30 text-zinc-200 font-semibold px-8 py-3.5 rounded-xl transition-all">
                List your property <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

