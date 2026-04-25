"use client";

type CategoryRow = {
  name: string;
  slug: string;
  parent: string;
  description?: string;
  
  isSubcategory?: boolean;
};

type CategoryTableProps = {
  rows: readonly CategoryRow[];
};

export default function CategoryTable({ rows }: CategoryTableProps) {
  return (
    <div className="table-wrap">
      <table className="category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Parent</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.parent}-${row.slug}`}>
              <td>
                <span className={row.isSubcategory ? "category-child-name" : "category-parent-name"}>
                  {row.isSubcategory ? `|- ${row.name}` : row.name}
                </span>
              </td>
              <td>{row.slug}</td>
              <td>{row.parent || "--"}</td>
              <td>{row.description || ""}</td>
              <td>
                <div className="action-row category-action-row">
                  <button
                    className="icon-button action-icon-button"
                    aria-label={`Edit ${row.name}`}
                    title="Edit"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M4 20h4l10-10-4-4L4 16v4Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 6l4 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="icon-button action-icon-button danger-icon-button"
                    aria-label={`Delete ${row.name}`}
                    title="Delete"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 7h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9 7V5h6v2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7l1 12h8l1-12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 11v4M14 11v4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
