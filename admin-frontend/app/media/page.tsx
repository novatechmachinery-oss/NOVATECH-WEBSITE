"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getMachines } from "@/lib/api";

export default function MediaPage() {
  const machines = getMachines();

  return (
    <AdminShell title="Media" description="Machine image references from dummy data.">
      <section className="stack-list">
        {machines.map((machine) => (
          <article key={machine.id} className="simple-card">
            <strong>{machine.name}</strong>
            <p>{machine.images.join(", ")}</p>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
