"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, LogIn, Loader2, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const friendlyError = (raw: string) => {
    if (raw.toLowerCase().includes("no account")) return "No account found with this email address.";
    if (raw.toLowerCase().includes("invalid password") || raw.toLowerCase().includes("invalid")) return "Incorrect password. Please try again.";
    if (raw.toLowerCase().includes("email and password")) return "Please enter both your email and password.";
    return raw || "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both your email and password.");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError(friendlyError(result.error));
      setLoading(false);
    } else {
      setSuccess("Signed in successfully! Redirecting…");
      setLoading(false);
      setTimeout(() => {
        router.push("/properties");
        router.refresh();
      }, 5000);
    }
  };

  const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 placeholder-zinc-600";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* ── Error modal ── */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-zinc-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl text-center"
          >
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-1">Sign In Failed</h2>
            <p className="text-red-300 text-sm mb-5">{error}</p>
            <button
              onClick={() => setError("")}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Success modal ── */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-zinc-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl text-center"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-1">Welcome Back!</h2>
            <p className="text-emerald-300 text-sm">{success}</p>
          </motion.div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Welcome Back</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your MutareRentals account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* spacer kept so form layout doesn't shift */}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Create one
            </Link>
          </p>
        </form>

        
      </motion.div>
    </div>
  );
}
