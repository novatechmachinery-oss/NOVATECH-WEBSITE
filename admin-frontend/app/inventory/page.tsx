"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getMachines } from "@/lib/api";
import { formatMachinePrice } from "@/lib/format";

export default function InventoryPage() {
  const machines = getMachines();

  return (
    <AdminShell
      title="Inventory"
      description="Current stock positions and category coverage across the machine catalog."
    >
      <section className="simple-grid">
        <article className="simple-card">
          <strong>Total Inventory Value</strong>
          <p>{formatMachinePrice(machines.reduce((total, machine) => total + machine.price, 0))}</p>
        </article>
        <article className="simple-card">
          <strong>In Stock Units</strong>
          <p>{machines.filter((machine) => machine.stockStatus === "In Stock").length}</p>
        </article>
        <article className="simple-card">
          <strong>Limited Units</strong>
          <p>{machines.filter((machine) => machine.stockStatus === "Limited").length}</p>
        </article>
      </section>
    </AdminShell>
  );
}
