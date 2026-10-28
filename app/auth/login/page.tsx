"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import AuthShell, { AuthField, authInputClass } from "@/components/content/AuthShell";
import PasswordInput from "@/components/content/PasswordInput";

const AUTH_TOKEN_KEY = "dealhobe_auth_token_v1";

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
      window.dispatchEvent(new Event("dealhobe-auth-changed"));
      router.push("/profile");
    } catch (err) {
      setError((err instanceof Error && err.message) || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      crumb="Sign in"
      eyebrow="Welcome back"
      title="Sign in to DealHobe"
      subtitle="Pick up where you left off — your orders, saved addresses and offers are waiting."
      footer={
        <>
          New to DealHobe?{" "}
          <Link href="/auth/register" className="font-bold text-primary-pink hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} noValidate className="flex flex-col gap-5">
        <AuthField id="identifier" label="Email or mobile number">
          <input
            id="identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="you@example.com or 01XXXXXXXXX"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
            className={authInputClass}
          />
        </AuthField>

        <AuthField id="password" label="Password">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
            autoComplete="current-password"
            invalid={Boolean(error)}
          />
        </AuthField>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-primary-pink/20 bg-primary-pink/[0.05] px-4 py-3 text-sm font-medium text-primary-pink">
            <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary-pink text-[15px] font-bold text-white shadow-button transition-[transform,background-color,opacity] hover:bg-[#8E1712] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <FiArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
