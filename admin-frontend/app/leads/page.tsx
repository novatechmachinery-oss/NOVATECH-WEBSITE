"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getLeads } from "@/lib/api";
import type { Lead } from "@/types/machine";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then(setLeads).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminShell title="Leads" description="Loading..."><p className="muted-text">Loading leads...</p></AdminShell>;
  }

  return (
    <AdminShell title="Leads" description="Buyer enquiries and current sales pipeline in one place.">
      <section className="panel">
        <div className="list-table">
          {leads.map((lead) => (
            <div key={lead.id} className="list-row">
              <div className="detail-stack"><strong>{lead.name}</strong><span>{lead.company}</span></div>
              <div className="detail-stack"><strong>{lead.interestedIn}</strong></div>
              <div><span className="badge limited">{lead.stage.toLowerCase()}</span></div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
