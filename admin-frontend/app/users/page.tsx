"use client";

import AdminShell from "@/components/layout/admin-shell";
import { getUsers } from "@/lib/api";

export default function UsersPage() {
  const users = getUsers();

  return (
    <AdminShell
      title="Users & Roles"
      description="Control who manages catalog, enquiries and operations."
      actions={<button className="primary-button">+ Add User</button>}
    >
      <section className="table-panel">
        <div className="list-table">
          {users.map((user) => (
            <div key={user.id} className="list-row four">
              <div className="detail-stack">
                <strong>{user.name}</strong>
              </div>
              <div className="detail-stack">
                <strong>{user.phone}</strong>
              </div>
              <div>
                <span className={user.role === "Super Admin" ? "badge super" : "badge limited"}>
                  {user.role}
                </span>
              </div>
              <div className="detail-stack">
                <strong>{user.joined}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
