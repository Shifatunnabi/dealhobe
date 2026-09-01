"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronRight, FiLogIn, FiAlertCircle } from "react-icons/fi";
import { ColorfulTitle } from "@/components/ui";

const AUTH_TOKEN_KEY = "joytoy_auth_token_v1";

export default function AuthLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      if (data?.authToken) {
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.authToken);
      }
      window.dispatchEvent(new Event("joytoy-auth-changed"));
      router.push("/profile");
    } catch (err: any) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-bg pt-34 pb-24">
      <div className="mx-auto max-w-md px-section">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <nav className="mb-4 flex items-center justify-center gap-2 text-small text-text-muted">
            <Link href="/" className="transition-colors hover:text-primary-pink">Home</Link>
            <FiChevronRight size={12} />
            <span className="font-semibold text-text-dark">Login</span>
          </nav>
          <ColorfulTitle title="Login" as="h1" className="text-primary-pink" />
          <p className="mt-2 font-inter text-sm text-text-muted">Sign in to manage your orders.</p>
        </motion.div>

        <form onSubmit={handleLogin} className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-text-dark">Email or Mobile</label>
              <input
                type="text"
                placeholder="you@example.com or 01XXXXXXXXX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-inter text-sm font-medium text-text-dark">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-soft-bg px-4 py-3 font-inter text-sm text-text-dark placeholder:text-text-muted/60 focus:border-primary-pink focus:bg-white focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <FiAlertCircle className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 font-inter font-semibold text-white shadow-button transition-all"
            >
              <FiLogIn size={16} />
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>

            <p className="text-center font-inter text-sm text-text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-primary-pink hover:underline">
                Register
              </Link>
            </p>

          </div>
        </form>
      </div>
    </div>
  );
}
