"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  RefreshCw,
  Settings2,
  ShieldCheck,
} from "lucide-react";

const ADMIN_EMAIL_HINT = "info@novatechmachinery.com";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isStandalone =
    typeof window !== "undefined" && !window.location.pathname.startsWith("/admin");
  const defaultFrom = isStandalone ? "/" : "/admin";
  const from = searchParams.get("from") || defaultFrom;

  const [email, setEmail] = useState(ADMIN_EMAIL_HINT);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (step === "credentials" && (!email.trim() || !password.trim())) {
      setError("Please enter the admin email and password.");
      return;
    }

    if (step === "otp" && !otp.trim()) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = step === "credentials" ? "/api/admin/login" : "/api/admin/login/verify";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          step === "credentials"
            ? JSON.stringify({
                email: email.trim(),
                password: password.trim(),
              })
            : JSON.stringify({
                email: email.trim(),
                otp: otp.trim(),
              }),
      });

      const data = (await response.json()) as { message?: string; error?: string; nextStep?: string };

      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }

      if (step === "credentials") {
        setStep("otp");
        setMessage(data.message || "Verification code sent. Check your email to continue.");
        return;
      }

      router.replace(from);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    setMessage(null);

    if (!email.trim() || !password.trim()) {
      setError("Please go back and enter the admin password again before resending the code.");
      return;
    }

    setResendLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to resend verification code.");
      }

      setOtp("");
      setMessage(data.message || "New verification code sent. Check your email again.");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Unable to resend verification code.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#07111f] px-4 py-12 text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(35,110,196,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(10,123,92,0.24),transparent_28%),linear-gradient(160deg,#040816_0%,#0a1728_55%,#07111f_100%)]" />
        <div className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[8%] top-[55%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-[480px] items-center justify-center">
        <div className="relative w-full">
          <div className="rounded-[2rem] border border-white/12 bg-white/95 p-7 shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur xl:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#0f3b63_0%,#145b93_55%,#1d8c78_100%)] text-white shadow-[0_18px_40px_rgba(20,91,147,0.28)]">
                <Settings2 className="h-7 w-7" />
              </div>
              <h1 className="mt-5 text-3xl font-black text-slate-900">Novatech Admin</h1>
              <p className="mt-2 text-sm text-slate-500">
                Use your authorized company credentials to continue.
              </p>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <p className="text-sm font-medium text-rose-700">{error}</p>
                </div>
              ) : null}

              {message ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-700">{message}</p>
                </div>
              ) : null}

              <label className="grid gap-2.5 text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Admin Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={ADMIN_EMAIL_HINT}
                  readOnly={step === "otp"}
                  autoFocus
                  autoComplete="username"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-[#145b93]/10"
                />
              </label>

              {step === "credentials" ? (
                <label className="grid gap-2.5 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-400" />
                    Admin Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-base outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-[#145b93]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              ) : (
                <label className="grid gap-2.5 text-sm font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    Email Verification Code
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter verification code"
                    autoComplete="one-time-code"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-[#145b93]/10"
                  />
                </label>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Authorized account:{" "}
                <span className="font-semibold text-slate-900">{ADMIN_EMAIL_HINT}</span>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  resendLoading ||
                  !email.trim() ||
                  (step === "credentials" ? !password.trim() : !otp.trim())
                }
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[linear-gradient(135deg,#0f3b63_0%,#145b93_55%,#1d8c78_100%)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(20,91,147,0.25)] transition hover:shadow-[0_14px_40px_rgba(20,91,147,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {step === "credentials" ? "Sending code..." : "Verifying..."}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {step === "credentials" ? "Send Verification Code" : "Access Admin Panel"}
                  </>
                )}
              </button>

              {step === "otp" ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => void handleResendOtp()}
                    disabled={loading || resendLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#145b93] transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw className={`h-4 w-4 ${resendLoading ? "animate-spin" : ""}`} />
                    {resendLoading ? "Resending code..." : "Resend verification code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setPassword("");
                      setOtp("");
                      setMessage(null);
                      setError(null);
                    }}
                    className="w-full text-center text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Use a different email or password
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#07111f]">
          <p className="text-slate-300">Loading...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
