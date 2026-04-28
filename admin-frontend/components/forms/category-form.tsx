"use client";

import { FormEvent, useState } from "react";

type CategoryFormProps = {
  onCancel: () => void;
  onSave?: () => void;
};

export default function CategoryForm({ onCancel, onSave }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryName.trim()) return;
    setSaving(true);
    setError(null);

    try {
      // Create the parent category
      const catRes = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      const catJson = await catRes.json();
      if (!catRes.ok) throw new Error(catJson.error ?? "Failed to create category");

      // Optionally create a subcategory under it
      if (subcategoryName.trim()) {
        const subRes = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: subcategoryName.trim(),
            parentId: catJson.data.id,
          }),
        });
        if (!subRes.ok) {
          const subJson = await subRes.json();
          throw new Error(subJson.error ?? "Failed to create subcategory");
        }
      }

      setCategoryName("");
      setSubcategoryName("");
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="category-popup-form" onSubmit={handleSubmit}>
      <label>
        <span>Category Name</span>
        <input
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
          placeholder="Enter category name"
          required
        />
      </label>

      <label>
        <span>Subcategory</span>
        <input
          value={subcategoryName}
          onChange={(event) => setSubcategoryName(event.target.value)}
          placeholder="Enter subcategory name (optional)"
        />
      </label>

      {error ? <p className="settings-notice error">{error}</p> : null}

      <div className="category-popup-actions">
        <button className="secondary-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
