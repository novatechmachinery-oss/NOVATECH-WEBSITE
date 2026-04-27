"use client";

import { useState } from "react";
import CategoryForm from "@/components/forms/category-form";
import AdminShell from "@/components/layout/admin-shell";
import CategoryTable from "@/components/tables/category-table";

const categoryRows = [
  { name: "Bar Machinery", slug: "bar-machinery", parent: "", description: "" },
  { name: "Bar Milling", slug: "bar-milling", parent: "Bar Machinery", isSubcategory: true },
  { name: "Bar Peeling", slug: "bar-peeling", parent: "Bar Machinery", isSubcategory: true },
  {
    name: "Bar Peeling cum Deep Hole Machinery",
    slug: "bar-peeling-deep-hole",
    parent: "Bar Machinery",
    isSubcategory: true,
  },
  { name: "Bending Machines", slug: "bending-machines", parent: "", description: "" },
  { name: "Bolt & Fasteners Machines", slug: "bolt-fasteners-machines", parent: "" },
  { name: "Broaching Machinery & Keyseaters", slug: "broaching-machinery-keyseaters", parent: "" },
  { name: "Horizontal", slug: "horizontal-broaching", parent: "Broaching Machinery & Keyseaters", isSubcategory: true },
  { name: "Vertical", slug: "vertical-broaching", parent: "Broaching Machinery & Keyseaters", isSubcategory: true },
  { name: "CNC Machines", slug: "cnc-machines", parent: "" },
  { name: "Drilling Machinery", slug: "drilling-machinery", parent: "" },
  { name: "Bench Drilling", slug: "bench-drilling", parent: "Drilling Machinery", isSubcategory: true },
  { name: "Deep Hole Drill", slug: "deep-hole-drill", parent: "Drilling Machinery", isSubcategory: true },
  { name: "Gang Drilling", slug: "gang-drilling", parent: "Drilling Machinery", isSubcategory: true },
  { name: "Radial Drilling", slug: "radial-drilling", parent: "Drilling Machinery", isSubcategory: true },
  { name: "EDM Machines", slug: "edm-machines", parent: "" },
  { name: "Forging & Foundry Machinery", slug: "forging-foundry-machinery", parent: "" },
  { name: "Continuous Casting Machines", slug: "continuous-casting-machines", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Die Casting Machine", slug: "die-casting-machine", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Forging Hammer", slug: "forging-hammer", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Forging Manipulators", slug: "forging-manipulators", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Forging Presses", slug: "forging-presses", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Horizontal Forging Upsetters", slug: "horizontal-forging-upsetters", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Hydraulic Forging Hammers", slug: "hydraulic-forging-hammers", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Ring Rolling", slug: "ring-rolling", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Screw Forging", slug: "screw-forging", parent: "Forging & Foundry Machinery", isSubcategory: true },
  { name: "Gear Machinery", slug: "gear-machinery", parent: "" },
  { name: "Gear Grinders", slug: "gear-grinders", parent: "Gear Machinery", isSubcategory: true },
  { name: "Gear Hobbers", slug: "gear-hobbers", parent: "Gear Machinery", isSubcategory: true },
  { name: "Gear Lappers", slug: "gear-lappers", parent: "Gear Machinery", isSubcategory: true },
  { name: "Gear Planner", slug: "gear-planner", parent: "Gear Machinery", isSubcategory: true },
  { name: "Gear Shapers", slug: "gear-shapers", parent: "Gear Machinery", isSubcategory: true },
  { name: "Koni Flex Type Gear Generators", slug: "koni-flex-gear-generators", parent: "Gear Machinery", isSubcategory: true },
  { name: "Pinion (Horizontal Hobbers)", slug: "pinion-horizontal-hobbers", parent: "Gear Machinery", isSubcategory: true },
  { name: "Spiral Bevel Gear Generators", slug: "spiral-bevel-gear-generators", parent: "Gear Machinery", isSubcategory: true },
  { name: "Straight Bevel Gear Generators", slug: "straight-bevel-gear-generators", parent: "Gear Machinery", isSubcategory: true },
  { name: "Grinders", slug: "grinders", parent: "" },
  { name: "Cylindrical Grinders", slug: "cylindrical-grinders", parent: "Grinders", isSubcategory: true },
  { name: "End Mill Grinders", slug: "end-mill-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Flute Grinders", slug: "flute-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Roll Grinders", slug: "roll-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Rotary Grinders", slug: "rotary-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Slideway Surface Grinders", slug: "slideway-surface-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Surface Grinders", slug: "surface-grinders", parent: "Grinders", isSubcategory: true },
  { name: "Honing Machines", slug: "honing-machines", parent: "" },
  { name: "Horizontal Boring Mills", slug: "horizontal-boring-mills", parent: "" },
  { name: "Floor Type", slug: "floor-type-boring", parent: "Horizontal Boring Mills", isSubcategory: true },
  { name: "Jig Boring", slug: "jig-boring", parent: "Horizontal Boring Mills", description: "jig boring", isSubcategory: true },
  { name: "Planner Type", slug: "planner-type-boring", parent: "Horizontal Boring Mills", isSubcategory: true },
  { name: "Table Type", slug: "table-type-boring", parent: "Horizontal Boring Mills", isSubcategory: true },
  { name: "Industrial Plants", slug: "industrial-plants", parent: "" },
  { name: "Inspection & Measuring Machines", slug: "inspection-measuring-machines", parent: "" },
  { name: "Laser Cutting Machines", slug: "laser", parent: "" },
  { name: "Lathes & Turning Machines", slug: "lathes-turning-machines", parent: "" },
  { name: "Five Axis Turn Mill Centres", slug: "five-axis-turn-mill-centres", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Heavy Duty Lathes", slug: "heavy-duty-lathes", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Horizontal Lathes", slug: "horizontal-lathes", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Relieving Lathes", slug: "relieving-lathes", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Roll Lathes", slug: "roll-lathes", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Turning and Milling Centres", slug: "turning-milling-centres", parent: "Lathes & Turning Machines", isSubcategory: true },
  { name: "Machining Centres", slug: "machining-centres", parent: "" },
  { name: "Five Axis Machining Centres", slug: "five-axis-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Gantry / Planner Type Machining Centres", slug: "gantry-planner-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Horizontal Machining Centres", slug: "horizontal-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Multi Tasking Machining Centres", slug: "multi-tasking-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Portal Type Machining Centres", slug: "portal-type-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Vertical Machining Centres", slug: "vertical-machining-centres", parent: "Machining Centres", isSubcategory: true },
  { name: "Milling Machines", slug: "milling-machines", parent: "" },
  { name: "Bed Type Milling Machines", slug: "bed-type-milling", parent: "Milling Machines", isSubcategory: true },
  { name: "Horizontal Milling", slug: "horizontal-milling", parent: "Milling Machines", isSubcategory: true },
  { name: "Planno Millers", slug: "planno-millers", parent: "Milling Machines", isSubcategory: true },
  { name: "Universal Milling", slug: "universal-milling", parent: "Milling Machines", isSubcategory: true },
  { name: "Vertical Milling", slug: "vertical-milling", parent: "Milling Machines", isSubcategory: true },
  { name: "Other Equipment", slug: "other-equipment", parent: "" },
  { name: "Others", slug: "others", parent: "" },
  { name: "Pharmaceutical Machinery", slug: "pharmaceutical-machinery", parent: "" },
  { name: "Plastic Machinery", slug: "plastic-machinery", parent: "" },
  { name: "Power Plants & Turbines", slug: "power-plants-turbines", parent: "" },
  { name: "Presses", slug: "presses", parent: "" },
  { name: "Forging Presses", slug: "press-forging-presses", parent: "Presses", isSubcategory: true },
  { name: "Hydraulic Presses", slug: "hydraulic-presses", parent: "Presses", isSubcategory: true },
  { name: "Screw Presses", slug: "screw-presses", parent: "Presses", isSubcategory: true },
  { name: "Stamping Presses", slug: "stamping-presses", parent: "Presses", isSubcategory: true },
  { name: "Try-Out Presses", slug: "try-out-presses", parent: "Presses", isSubcategory: true },
  { name: "Robots", slug: "robots", parent: "" },
  { name: "Multi Purpose Robots", slug: "multi-purpose-robots", parent: "Robots", isSubcategory: true },
  { name: "Upto 5 Axis Robots", slug: "upto-5-axis-robots", parent: "Robots", isSubcategory: true },
  { name: "Roll Formers & Rolling Mills", slug: "roll-formers-rolling-mills", parent: "" },
  { name: "Saws", slug: "saws", parent: "" },
  { name: "Horizontal Band Saws", slug: "horizontal-band-saws", parent: "Saws", isSubcategory: true },
  { name: "Vertical Band Saws", slug: "vertical-band-saws", parent: "Saws", isSubcategory: true },


  
] as const;

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <AdminShell
      title="Categories"
      description="Organize machines under high-level categories and focused subcategories."
      actions={
        <button className="primary-button" onClick={() => setShowAddModal(true)} type="button">
          + Add Category
        </button>
      }
    >
      <section className="table-panel">
        <div className="table-toolbar">
          <div>
            <strong>{categoryRows.length} category rows</strong>
            <p className="muted-text">Dummy admin category listing based on your shared layout.</p>
          </div>
        </div>
        <CategoryTable rows={categoryRows} />
      </section>

      {showAddModal ? (
        <div className="dialog-backdrop">
          <div className="dialog-card category-popup-card">
            <div className="dialog-head">
              <div>
                <h3>Add Category</h3>
                <p>Create a parent category and optionally add one subcategory.</p>
              </div>
              <button
                className="icon-button modal-close-button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add category popup"
                title="Close"
                type="button"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <CategoryForm
              onCancel={() => setShowAddModal(false)}
              onSave={() => setShowAddModal(false)}
            />
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
