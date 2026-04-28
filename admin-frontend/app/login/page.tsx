"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@novatechmachinery.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Login failed. Check your credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="login-card">
        <div className="login-badge">Novatech Admin</div>
        <h1>Sign In</h1>
        <p>Enter your credentials to access the admin panel.</p>

        <form className="settings-form" onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
          <label className="settings-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@novatechmachinery.com"
              required
              autoComplete="username"
            />
          </label>

          <label className="settings-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </label>

          {error ? <p className="settings-notice error">{error}</p> : null}

          <div className="settings-actions">
            <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--muted-text, #888)", textAlign: "center" }}>
          Default: admin@novatechmachinery.com / admin123
        </p>
      </div>
    </main>
  );
}
