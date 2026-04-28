"use client";

import { useEffect, useState } from "react";
import CategoryForm from "@/components/forms/category-form";
import AdminShell from "@/components/layout/admin-shell";
import CategoryTable from "@/components/tables/category-table";

type CategoryRow = {
  name: string;
  slug: string;
  parent: string;
  description?: string;
  isSubcategory?: boolean;
};

export default function CategoriesPage() {
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const rows: CategoryRow[] = [];
          for (const cat of json.data) {
            // Top-level categories
            const topLevel = json.data.filter((c: { parentId: string | null }) => !c.parentId);
            const subs = json.data.filter((c: { parentId: string | null }) => c.parentId);

            // Build flat row list for the table
            if (!cat.parentId) {
              rows.push({ name: cat.name, slug: cat.slug, parent: "", description: cat.description ?? "" });
              // Find subcategories of this category
              const children = subs.filter((s: { parentId: string }) => s.parentId === cat.id);
              for (const child of children) {
                rows.push({ name: child.name, slug: child.slug, parent: cat.name, isSubcategory: true });
              }
            }
          }
          // Deduplicate
          const unique = rows.filter((row, idx, arr) => arr.findIndex((r) => r.slug === row.slug) === idx);
          setCategoryRows(unique);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return <AdminShell title="Categories" description="Loading..."><p className="muted-text">Loading categories...</p></AdminShell>;
  }

  return (
    <AdminShell
      title="Categories"
      description="Organize machines under high-level categories and focused subcategories."
      actions={
        <button className="primary-button" onClick={() => setShowAddModal(true)} type="button">
          + Add Category
        </button>
      }
    >
      <section className="table-panel">
        <div className="table-toolbar">
          <div>
            <strong>{categoryRows.length} category rows</strong>
            <p className="muted-text">Categories loaded from Supabase database.</p>
          </div>
        </div>
        <CategoryTable rows={categoryRows} />
      </section>

      {showAddModal ? (
        <div className="dialog-backdrop">
          <div className="dialog-card category-popup-card">
            <div className="dialog-head">
              <div>
                <h3>Add Category</h3>
                <p>Create a parent category and optionally add one subcategory.</p>
              </div>
              <button className="icon-button modal-close-button" onClick={() => setShowAddModal(false)} aria-label="Close add category popup" title="Close" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <CategoryForm onCancel={() => setShowAddModal(false)} onSave={() => { setShowAddModal(false); window.location.reload(); }} />
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
