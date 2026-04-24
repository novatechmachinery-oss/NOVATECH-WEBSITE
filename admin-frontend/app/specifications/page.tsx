"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getMachines } from "@/lib/api";
import type { Machine } from "@/types/machine";

export default function SpecificationsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    setMachines(getMachines());
  }, []);

  return (
    <AdminShell
      title="Specifications"
      description="Each machine can hold JSON style specification key value pairs."
    >
      <section className="stack-list">
        {machines.map((machine) => (
          <article key={machine.id} className="simple-card">
            <strong>{machine.name}</strong>
            <p>
              {machine.specifications.map((item) => `${item.key}: ${item.value}`).join(" | ")}
            </p>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
