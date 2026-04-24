"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="login-screen">
      <div className="login-card">
        <div className="login-badge">Novatech Admin</div>
        <h1>Preview mode</h1>
        <p>Admin panel abhi bina username aur password ke open hoga.</p>
        <button className="primary-button" onClick={() => router.push("/dashboard")}>
          Open admin panel
        </button>
      </div>
    </main>
  );
}
