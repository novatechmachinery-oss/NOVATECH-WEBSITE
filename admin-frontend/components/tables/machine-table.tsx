"use client";

import type { Machine } from "@/types/machine";

type MachineTableProps = {
  machines: Machine[];
  onView: (machine: Machine) => void;
  onEdit: (machine: Machine) => void;
  onDelete: (machine: Machine) => void;
};

function getStatusClass(stockStatus: string) {
  if (stockStatus === "In Stock") {
    return "badge available";
  }

  if (stockStatus === "Limited") {
    return "badge limited";
  }

  return "badge out";
}

export default function MachineTable({ machines, onView, onEdit, onDelete }: MachineTableProps) {
  return (
    <div className="table-wrap">
      <table className="machine-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Type</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={machine.id}>
              <td>
                <div className="machine-name-cell">
                  <img className="machine-thumb" src={machine.images[0]} alt={machine.name} />
                  <div className="name-stack">
                    <strong>{machine.name}</strong>
                    <span>{machine.subcategory}</span>
                  </div>
                </div>
              </td>
              <td>{machine.brand}</td>
              <td>{machine.machineType}</td>
              <td>{machine.category}</td>
              <td>{machine.condition}</td>
              <td>
                <span className={getStatusClass(machine.stockStatus)}>
                  {machine.stockStatus === "In Stock" ? "available" : machine.stockStatus.toLowerCase()}
                </span>
              </td>
              <td>
                <div className="action-row">
                  <button
                    className="icon-button action-icon-button"
                    onClick={() => onView(machine)}
                    aria-label={`View ${machine.name}`}
                    title="View"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </button>
                  <button
                    className="icon-button action-icon-button"
                    onClick={() => onEdit(machine)}
                    aria-label={`Edit ${machine.name}`}
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
                    onClick={() => onDelete(machine)}
                    aria-label={`Delete ${machine.name}`}
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
          {machines.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-state">
                No machines found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
