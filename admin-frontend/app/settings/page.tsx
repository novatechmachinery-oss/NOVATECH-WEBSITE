"use client";

import AdminShell from "@/components/layout/admin-shell";

export default function SettingsPage() {
  return (
    <AdminShell
      title="Settings"
      description="General workspace preferences and panel behavior placeholders."
    >
      <section className="simple-grid">
        <article className="simple-card">
          <strong>Access Mode</strong>
          <p>Preview mode without login lock</p>
        </article>
        <article className="simple-card">
          <strong>Data Source</strong>
          <p>Dynamic dummy data with local storage persistence</p>
        </article>
        <article className="simple-card">
          <strong>Delete Protection</strong>
          <p>Confirmation prompt enabled on machine removal</p>
        </article>
      </section>
    </AdminShell>
  );
}
