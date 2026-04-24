"use client";

import { FormEvent, useState } from "react";

type CategoryFormProps = {
  onCancel: () => void;
  onSave?: (values: { categoryName: string; subcategoryName: string }) => void;
};

export default function CategoryForm({ onCancel, onSave }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave?.({
      categoryName: categoryName.trim(),
      subcategoryName: subcategoryName.trim(),
    });
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

      <div className="category-popup-actions">
        <button className="secondary-button" onClick={onCancel} type="button">
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}
