"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  machineCategories,
  machineInventory,
} from "../data/metalWorkingCatalog";

type MachineMode = "all" | "conventional" | "cnc";

export default function MetalWorkingCatalogue() {
  const [categorySearch, setCategorySearch] = useState("");
  const [machineSearch, setMachineSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "a-z">("newest");
  const [machineMode, setMachineMode] = useState<MachineMode>("all");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(machineCategories.map((c) => [c.name, false]))
  );

  const subcategoryToCategory = useMemo(
    () =>
      new Map(
        machineCategories.flatMap((cat) =>
          (cat.sub ?? []).map((sub) => [sub, cat.name] as const)
        )
      ),
    []
  );

  const filteredSidebarCategories = useMemo(() => {
    const q = categorySearch.toLowerCase();
    return machineCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sub?.some((s) => s.toLowerCase().includes(q))
    );
  }, [categorySearch]);

  const filteredMachines = useMemo(() => {
    const q = machineSearch.toLowerCase();

    let result = machineInventory.filter((m) => {
      return (
        (machineMode === "all" || m.machineType === machineMode) &&
        (!selectedCategory || m.category === selectedCategory) &&
        (!selectedSubcategory || m.subcategory === selectedSubcategory) &&
        (!q ||
          [m.title, m.description, m.category, m.subcategory]
            .filter(Boolean)
            .some((v) => v?.toLowerCase().includes(q)))
      );
    });

    if (sortBy === "a-z") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [machineMode, selectedCategory, selectedSubcategory, machineSearch, sortBy]);

  function toggleCategory(name: string) {
    setOpenCategories((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  function toggleSubcategory(sub: string) {
    setSelectedSubcategory((cur) => (cur === sub ? null : sub));
    setSelectedCategory(subcategoryToCategory.get(sub) ?? null);
  }

  function clearFilters() {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setMachineSearch("");
    setCategorySearch("");
    setMachineMode("all");
    setSortBy("newest");
  }

  const toolbarButtons = [
    { label: "ALL MACHINES", value: "all" },
    { label: "CONVENTIONAL", value: "conventional" },
    { label: "CNC", value: "cnc" },
  ];

  return (
    <section className="mx-auto max-w-[1460px] px-4 pb-12 pt-6">

      {/* HEADER */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-900">Machines</span>
        </div>

        <h1 className="mt-3 text-5xl font-black text-slate-950">
          Industrial Machinery
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Browse our complete inventory of premium industrial machines with quick category-based filtering.
        </p>

        {/* Search + Sort */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <input
            value={machineSearch}
            onChange={(e) => setMachineSearch(e.target.value)}
            placeholder="Search machines..."
            className="px-4 py-3 rounded-xl border w-[260px]"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 rounded-xl border w-[200px]"
          >
            <option value="newest">Newest first</option>
            <option value="a-z">A to Z</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setMachineMode(btn.value as MachineMode)}
              className={`px-6 py-3 rounded-xl font-bold ${
                machineMode === btn.value
                  ? "bg-red-500 text-white"
                  : "border border-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}

          <div className="ml-auto flex gap-3">
            <button
              onClick={clearFilters}
              className="px-4 py-3 border rounded-xl"
            >
              Reset Filters
            </button>

            <div className="px-4 py-3 bg-slate-100 rounded-xl font-semibold">
              {filteredMachines.length} machines found
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mt-6 grid lg:grid-cols-[300px_1fr] gap-6">

        {/* SIDEBAR */}
        <aside>
          <input
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search category..."
            className="w-full mb-4 px-4 py-3 border rounded-xl"
          />

          {filteredSidebarCategories.map((cat) => {
            const isOpen = openCategories[cat.name];
            const hasChildren = !!cat.sub?.length;

            return (
              <div key={cat.name} className="border-b">

                <button
                  onClick={() => hasChildren && toggleCategory(cat.name)}
                  className="w-full flex justify-between px-4 py-4 font-semibold hover:bg-slate-100"
                >
                  {cat.name}

                  {hasChildren && (
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute h-[2px] w-4 bg-slate-700"></span>
                      <span
                        className={`absolute w-[2px] h-4 bg-slate-700 ${
                          isOpen ? "opacity-0" : "opacity-100"
                        }`}
                      ></span>
                    </span>
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  {cat.sub?.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => toggleSubcategory(sub)}
                      className="block w-full text-left px-6 py-2 text-sm hover:bg-slate-100"
                    >
                      {sub}
                    </button>
                  ))}
                </div>

              </div>
            );
          })}
        </aside>

        {/* PRODUCTS */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMachines.map((m) => (
            <div key={m.id} className="border rounded-xl overflow-hidden shadow-sm">

              {/* IMAGE FIX */}
              <div className="w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={m.imageSrc}
                  alt={m.title}
                  width={500}
                  height={375}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg">{m.title}</h3>
                <p className="text-sm text-slate-600">{m.description}</p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}