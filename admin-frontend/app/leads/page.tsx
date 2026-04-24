"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getLeads } from "@/lib/api";

export default function LeadsPage() {
  const leads = getLeads();

  return (
    <AdminShell
      title="Leads"
      description="Buyer enquiries and current sales pipeline in one place."
    >
      <section className="panel">
        <div className="list-table">
          {leads.map((lead) => (
            <div key={lead.id} className="list-row">
              <div className="detail-stack">
                <strong>{lead.name}</strong>
                <span>{lead.company}</span>
              </div>
              <div className="detail-stack">
                <strong>{lead.interestedIn}</strong>
              </div>
              <div>
                <span className="badge limited">{lead.stage.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
