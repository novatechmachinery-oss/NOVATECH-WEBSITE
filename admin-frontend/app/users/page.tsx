"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/layout/admin-shell";
import { getUsers } from "@/lib/api";
import type { UserRecord } from "@/types/machine";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AdminShell title="Users & Roles" description="Loading..."><p className="muted-text">Loading users...</p></AdminShell>;
  }

  return (
    <AdminShell title="Users & Roles" description="Control who manages catalog, enquiries and operations." actions={<button className="primary-button">+ Add User</button>}>
      <section className="table-panel">
        <div className="list-table">
          {users.map((user) => (
            <div key={user.id} className="list-row four">
              <div className="detail-stack"><strong>{user.name}</strong></div>
              <div className="detail-stack"><strong>{user.phone}</strong></div>
              <div><span className={user.role === "Super Admin" ? "badge super" : "badge limited"}>{user.role}</span></div>
              <div className="detail-stack"><strong>{user.joined}</strong></div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
