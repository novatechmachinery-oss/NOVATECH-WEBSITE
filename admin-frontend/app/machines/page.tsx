"use client";

import { useEffect, useMemo, useState } from "react";
import MachineForm from "@/components/forms/machine-form";
import AdminShell from "@/components/layout/admin-shell";
import MachineTable from "@/components/tables/machine-table";
import { createMachine, deleteMachine, getMachines, updateMachine } from "@/lib/api";
import { formatMachinePrice } from "@/lib/format";
import type { Machine, MachineFormValues } from "@/types/machine";

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingMachine, setViewingMachine] = useState<Machine | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMachines().then(setMachines).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredMachines = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return machines;
    return machines.filter((machine) =>
      [machine.name, machine.brand, machine.category, machine.subcategory, machine.machineType]
        .join(" ").toLowerCase().includes(query)
    );
  }, [machines, search]);

  const openAddModal = () => { setViewingMachine(null); setEditingMachine(null); setShowForm(true); };

  const handleAdd = async (values: MachineFormValues) => {
    const updated = await createMachine(values);
    setMachines(updated);
    setShowForm(false);
  };

  const handleEdit = async (values: MachineFormValues) => {
    if (!editingMachine) return;
    const updated = await updateMachine(editingMachine.id, values);
    setMachines(updated);
    setEditingMachine(null);
    setShowForm(false);
  };

  const handleEditStart = (machine: Machine) => { setViewingMachine(null); setEditingMachine(machine); setShowForm(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const updated = await deleteMachine(deleteTarget.id);
    setMachines(updated);
    if (viewingMachine?.id === deleteTarget.id) setViewingMachine(null);
    if (editingMachine?.id === deleteTarget.id) { setEditingMachine(null); setShowForm(false); }
    setDeleteTarget(null);
  };

  if (loading) {
    return <AdminShell title="Machines" description="Loading..."><p className="muted-text">Loading machines...</p></AdminShell>;
  }

  return (
    <AdminShell
      title="Machines"
      description="Manage machine inventory with searchable rows, quick edit and delete confirmation."
      actions={
        <>
          <input className="search-box" placeholder="Search machines..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <button className="primary-button" onClick={openAddModal}>+ Add Machine</button>
        </>
      }
    >
      <section className="table-panel">
        <div className="table-toolbar">
          <div>
            <strong>{filteredMachines.length} machines</strong>
            <p className="muted-text">Connected to Supabase database.</p>
          </div>
        </div>
        <MachineTable machines={filteredMachines} onView={setViewingMachine} onEdit={handleEditStart} onDelete={(machine) => setDeleteTarget(machine)} />
      </section>

      {viewingMachine ? (
        <div className="dialog-backdrop">
          <div className="dialog-card machine-view-card">
            <div className="dialog-head">
              <div><h3>{viewingMachine.name}</h3><p>{viewingMachine.brand} / {viewingMachine.model}</p></div>
              <button className="icon-button modal-close-button" onClick={() => setViewingMachine(null)} aria-label="Close view" title="Close" type="button">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="machine-view-body">
              <img className="machine-view-image" src={viewingMachine.images[0]} alt={viewingMachine.name} />
              <div className="machine-view-grid">
                <div className="detail-stack"><strong>Category</strong><span>{viewingMachine.category}</span></div>
                <div className="detail-stack"><strong>Subcategory</strong><span>{viewingMachine.subcategory}</span></div>
                <div className="detail-stack"><strong>Machine type</strong><span>{viewingMachine.machineType}</span></div>
                <div className="detail-stack"><strong>Stock status</strong><span>{viewingMachine.stockStatus}</span></div>
                <div className="detail-stack"><strong>Serial no</strong><span>{viewingMachine.serialNumber}</span></div>
                <div className="detail-stack"><strong>Country</strong><span>{viewingMachine.countryOfOrigin}</span></div>
                <div className="detail-stack"><strong>Condition</strong><span>{viewingMachine.condition}</span></div>
                <div className="detail-stack"><strong>Price</strong><span>{formatMachinePrice(viewingMachine.price)}</span></div>
              </div>
              <div className="detail-stack"><strong>Description</strong><span>{viewingMachine.description}</span></div>
              <div className="detail-stack">
                <strong>Specifications</strong>
                <span>{viewingMachine.specifications.map((item) => `${item.key}: ${item.value}`).join(", ")}</span>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={() => setViewingMachine(null)} type="button">Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div className="modal-backdrop">
          <div className="modal-card large">
            <div className="modal-head">
              <h3>{editingMachine ? "Edit Machine" : "Add Machine"}</h3>
              <p>Use this form to manage all key machine details.</p>
            </div>
            <div className="modal-body">
              <MachineForm key={editingMachine?.id ?? "new"} initialValues={editingMachine} onSubmit={editingMachine ? handleEdit : handleAdd} />
            </div>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => { setShowForm(false); setEditingMachine(null); }}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="dialog-backdrop">
          <div className="dialog-card">
            <div className="dialog-head">
              <h3>Delete machine</h3>
              <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong> from inventory?</p>
            </div>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="danger-button" onClick={handleDeleteConfirm} type="button">Confirm Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
