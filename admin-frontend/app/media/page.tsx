"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getMachines } from "@/lib/api";
import type { Machine } from "@/types/machine";

export default function MediaPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminShell title="Media" description="Loading..."><p className="muted-text">Loading media...</p></AdminShell>;
  }

  return (
    <AdminShell title="Media" description="Machine image references from database.">
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
