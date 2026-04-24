"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getSubcategoryMap } from "@/lib/api";

export default function SubcategoriesPage() {
  const map = getSubcategoryMap();

  return (
    <AdminShell
      title="Subcategories"
      description="Granular machine groups mapped under each parent category."
    >
      <section className="stack-list">
        {Object.entries(map).map(([category, values]) => (
          <article key={category} className="simple-card">
            <strong>{category}</strong>
            <p>{values.join(", ")}</p>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
