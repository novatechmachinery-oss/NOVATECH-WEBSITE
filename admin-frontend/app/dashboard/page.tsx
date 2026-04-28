"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getLeadPipeline, getLeads, getMachineStats, getMachines } from "@/lib/api";
import { formatMachinePrice } from "@/lib/format";
import type { Lead, Machine } from "@/types/machine";

export default function DashboardPage() {
  const [latestMachines, setLatestMachines] = useState<Machine[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalMachines: 0, availableMachines: 0, reservedMachines: 0,
    totalLeads: 0, newToday: 0, dealsWon: 0, totalCategories: 0, totalSubcategories: 0,
  });
  const [pipeline, setPipeline] = useState<Array<{ stage: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [machines, leads, dashStats, leadPipe] = await Promise.all([
          getMachines(), getLeads(), getMachineStats(), getLeadPipeline(),
        ]);
        setLatestMachines(machines.slice(0, 5));
        setRecentLeads(leads);
        setStats(dashStats);
        setPipeline(leadPipe);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <AdminShell title="Dashboard" description="Loading...">
        <p className="muted-text">Loading dashboard data...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Dashboard"
      description="Overview of machines, leads, users and current stock movement."
    >
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge blue">M</span></div>
          <strong>{stats.totalMachines}</strong><span>Total Machines</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge green">A</span></div>
          <strong>{stats.availableMachines}</strong><span>Available</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge amber">R</span></div>
          <strong>{stats.reservedMachines}</strong><span>Reserved</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge blue">L</span></div>
          <strong>{stats.totalLeads}</strong><span>Total Leads</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge amber">N</span></div>
          <strong>{stats.newToday}</strong><span>New Today</span>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-badge green">W</span></div>
          <strong>{stats.dealsWon}</strong><span>Deals Won</span>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div><h2>Conversion Rate</h2><p>Live once backend lead statuses are connected</p></div>
          </div>
          <strong style={{ fontSize: "3rem", letterSpacing: "-0.06em" }}>18%</strong>
          <p className="muted-text">of leads converted this month</p>
          <div className="progress-line"><span style={{ width: "18%" }} /></div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div><h2>Lead Pipeline</h2><p>Stage-wise movement of current enquiries</p></div>
          </div>
          <div className="pipeline-list">
            {pipeline.map((item) => (
              <div key={item.stage} className="pipeline-row">
                <strong>{item.stage}</strong>
                <div className="progress-line">
                  <span style={{ width: `${Math.max(item.count * 18, 6)}%` }} />
                </div>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid-two">
        <article className="panel">
          <div className="panel-head">
            <div><h2>Recent Leads</h2><p>Latest incoming interest from buyers</p></div>
          </div>
          <div className="list-table">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="list-row">
                <div className="detail-stack"><strong>{lead.name}</strong><span>{lead.company}</span></div>
                <div className="detail-stack"><strong>{lead.interestedIn}</strong></div>
                <div><span className="badge limited">{lead.stage.toLowerCase()}</span></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div><h2>Recently Added Machines</h2><p>Inventory highlights from your catalog</p></div>
          </div>
          <div className="list-table">
            {latestMachines.map((machine) => (
              <div key={machine.id} className="list-row">
                <div className="detail-stack"><strong>{machine.name}</strong><span>{machine.brand}</span></div>
                <div className="detail-stack"><strong>{formatMachinePrice(machine.price)}</strong></div>
                <div>
                  <span className={machine.stockStatus === "In Stock" ? "badge available" : "badge limited"}>
                    {machine.stockStatus === "In Stock" ? "available" : machine.stockStatus.toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
