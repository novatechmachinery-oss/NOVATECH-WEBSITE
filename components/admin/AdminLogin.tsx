"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Lock, Eye, EyeOff, LogIn, AlertCircle, Settings2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Adapt routing for both the main app (/admin) and the standalone app (/)
  const isStandalone = typeof window !== "undefined" && !window.location.pathname.startsWith("/admin");
  const defaultFrom = isStandalone ? "/" : "/admin";
  const from = searchParams.get("from") || defaultFrom;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      router.replace(from);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#edf2f7] px-4 py-12">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#145b93]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#2f7fc7]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(135deg,#0d3f66_0%,#155b92_60%,#2f7fc7_100%)] text-white shadow-[0_16px_40px_rgba(20,91,147,0.3)]">
            <Settings2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-slate-900">Novatech Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Enter your password to access the admin panel</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="rounded-[1.6rem] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
        >
          {error ? (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="text-sm font-medium text-rose-700">{error}</p>
            </div>
          ) : null}

          <label className="grid gap-2.5 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-400" />
              Admin Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-base outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-[#145b93]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[linear-gradient(135deg,#0d3f66_0%,#155b92_60%,#2f7fc7_100%)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(20,91,147,0.25)] transition hover:shadow-[0_14px_40px_rgba(20,91,147,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Protected area &middot; Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#edf2f7]">
          <p className="text-slate-500">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
