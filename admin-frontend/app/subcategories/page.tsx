"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getSubcategoryMap } from "@/lib/api";

export default function SubcategoriesPage() {
  const [map, setMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubcategoryMap().then(setMap).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminShell title="Subcategories" description="Loading..."><p className="muted-text">Loading subcategories...</p></AdminShell>;
  }

  return (
    <AdminShell title="Subcategories" description="Granular machine groups mapped under each parent category.">
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
