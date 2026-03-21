"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, TrendingUp, PlusCircle, BarChart2, Menu, X, Brain, Sparkles, LogIn, UserCircle, LogOut, Shield, Bell, GitBranch } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Listings", icon: MapPin },
  { href: "/map", label: "Map View", icon: MapPin },
  { href: "/predict", label: "Price Calculator", icon: TrendingUp },
  { href: "/algorithms", label: "Algorithms", icon: GitBranch },
  { href: "/requisitions", label: "Requisitions", icon: Bell },
  { href: "/list-property", label: "List Property", icon: PlusCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[#0a0a0f]/95 backdrop-blur-xl border-zinc-800/80 shadow-lg shadow-black/20"
          : "bg-[#0a0a0f]/80 backdrop-blur-md border-zinc-800/40"
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/40 transition-all duration-300">
              <Brain className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-bold text-zinc-100 text-lg tracking-tight">
                Mutare
              </span>
              <span className="font-bold text-emerald-400 text-lg tracking-tight">
                Rentals
              </span>
              <Sparkles className="w-3 h-3 text-emerald-500/60 ml-0.5 animate-pulse" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    isActive
                      ? "text-emerald-400"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive && "text-emerald-400")} />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Admin-only links */}
            {isAdmin && (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    pathname === "/dashboard"
                      ? "text-amber-400"
                      : "text-amber-500/70 hover:text-amber-400 hover:bg-zinc-800/50"
                  )}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Dashboard
                  {pathname === "/dashboard" && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    "relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5",
                    pathname === "/admin"
                      ? "text-amber-400"
                      : "text-amber-500/70 hover:text-amber-400 hover:bg-zinc-800/50"
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                  {pathname === "/admin" && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </>
            )}

            {/* Auth section */}
            <div className="ml-2 pl-2 border-l border-zinc-800/60">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-400">
                        {session.user.name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <span className="hidden lg:inline max-w-[100px] truncate">{session.user.name}</span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl shadow-black/30 z-50"
                      >
                        <div className="px-4 py-3 border-b border-zinc-800/60">
                          <p className="text-sm font-medium text-zinc-200 truncate">{session.user.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
                          <span className={`inline-flex items-center mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isAdmin ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                          }`}>
                            {session.user.role}
                          </span>
                        </div>
                        <div className="py-1">
                          <Link href="/my-listings" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors">
                            <PlusCircle className="w-4 h-4" /> My Listings
                          </Link>
                          {isAdmin && (
                            <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400/70 hover:text-amber-400 hover:bg-zinc-800/50 transition-colors">
                              <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={() => { setUserMenuOpen(false); signOut(); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-zinc-800/50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-800/50 bg-[#0a0a0f]/98 backdrop-blur-xl overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    pathname === href
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      pathname === "/dashboard"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "text-amber-500/70 hover:text-amber-400 hover:bg-zinc-800/50"
                    )}
                  >
                    <BarChart2 className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      pathname === "/admin"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "text-amber-500/70 hover:text-amber-400 hover:bg-zinc-800/50"
                    )}
                  >
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                </>
              )}
              <div className="border-t border-zinc-800/50 pt-2 mt-2">
                {session ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400">
                      <UserCircle className="w-4 h-4" />
                      <span className="truncate">{session.user.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ${
                        isAdmin ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-500"
                      }`}>{session.user.role}</span>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-zinc-800/50 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
