"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getCategoryOptions, getSubcategoryMap } from "@/lib/api";

export default function CategoriesPage() {
  const categories = getCategoryOptions();
  const subcategories = getSubcategoryMap();

  return (
    <AdminShell
      title="Categories"
      description="Organize machines under high-level categories and focused subcategories."
    >
      <section className="simple-grid">
        {categories.map((category) => (
          <article key={category} className="simple-card">
            <strong>{category}</strong>
            <p>{(subcategories[category] ?? []).join(", ")}</p>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
