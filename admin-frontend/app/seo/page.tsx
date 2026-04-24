"use client";

import AdminShell from "@/components/layout/admin-shell";

export default function SeoPage() {
  return (
    <AdminShell
      title="SEO"
      description="Content and metadata health placeholders for future optimization workflows."
    >
      <section className="simple-grid">
        <article className="simple-card">
          <strong>Indexable Pages</strong>
          <p>42 active pages prepared for optimization</p>
        </article>
        <article className="simple-card">
          <strong>Meta Coverage</strong>
          <p>85% pages have title and description mapped</p>
        </article>
        <article className="simple-card">
          <strong>Priority</strong>
          <p>Machine detail pages should be optimized first</p>
        </article>
      </section>
    </AdminShell>
  );
}
