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
  const [machineSearch, setMachineSearch] = useState("");
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

  const filteredMachines = useMemo(() => {
    const q = machineSearch.toLowerCase();

    return machineInventory.filter((m) => {
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
  }, [machineMode, selectedCategory, selectedSubcategory, machineSearch]);

  function toggleCategory(name: string) {
    const category = machineCategories.find((item) => item.name === name);
    const hasChildren = !!category?.sub?.length;

    if (!hasChildren) {
      setSelectedSubcategory(null);
      setSelectedCategory((current) => (current === name ? null : name));
      setOpenCategories(Object.fromEntries(machineCategories.map((c) => [c.name, false])));
      return;
    }

    const nextIsOpen = !openCategories[name];
    setSelectedCategory(name);
    setSelectedSubcategory(null);
    setOpenCategories(
      Object.fromEntries(
        machineCategories.map((category) => [
          category.name,
          category.name === name ? nextIsOpen : false,
        ])
      )
    );
  }

  function toggleSubcategory(sub: string) {
    setSelectedSubcategory((cur) => (cur === sub ? null : sub));
    setSelectedCategory(subcategoryToCategory.get(sub) ?? null);
  }

  const toolbarButtons = [
    { label: "ALL MACHINES", value: "all" },
    { label: "CONVENTIONAL", value: "conventional" },
    { label: "CNC", value: "cnc" },
  ];

  const categoryBaseClasses =
    "relative z-10 flex w-full items-center justify-between border px-4 py-3.5 text-left text-[0.95rem] font-semibold transition-all duration-300 sm:px-5";
  const subcategoryBaseClasses =
    "flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-[#fff7f7] hover:text-[#e3000f] sm:px-5";

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

      </div>

      {/* MAIN */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">

        {/* SIDEBAR */}
        <aside>
          <div className="rounded-[28px] border border-slate-200 bg-[#f7f7f8] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-4">
            <div className="mb-4 px-2">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                Machine Menu
              </p>
            </div>

            <div className="space-y-3">
            {machineCategories.map((cat) => {
              const isOpen = openCategories[cat.name];
              const hasChildren = !!cat.sub?.length;
              const isActiveCategory =
                selectedCategory === cat.name && !selectedSubcategory;

              return (
                <div key={cat.name} className="relative">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className={`${categoryBaseClasses} ${
                      isOpen || isActiveCategory
                        ? `border-[#e3000f] bg-[#e3000f] text-white shadow-[0_10px_22px_rgba(227,0,15,0.28)] ${
                            hasChildren && isOpen ? "rounded-t-[18px] rounded-b-[10px]" : "rounded-[18px]"
                          }`
                        : "rounded-[18px] border-white bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                    }`}
                  >
                    <span className="pr-4 leading-snug">{cat.name}</span>

                    {hasChildren && (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-lg leading-none">
                        {isOpen ? "-" : "+"}
                      </span>
                    )}
                  </button>

                  {hasChildren && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[520px] -mt-2 px-1 pt-0 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="rounded-[0_0_22px_22px] border border-[#f3d8d8] bg-white px-3 pb-3 pt-5 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
                        <div className="space-y-1">
                          {cat.sub?.map((sub) => (
                            <button
                              key={sub}
                              onClick={() => toggleSubcategory(sub)}
                              className={`${subcategoryBaseClasses} ${
                                selectedSubcategory === sub
                                  ? "border border-[#f2dede] bg-[#fff7f7] text-[#e3000f] shadow-[0_6px_16px_rgba(227,0,15,0.08)]"
                                  : ""
                              }`}
                            >
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300"></span>
                              {sub}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </aside>

        {/* PRODUCTS */}
        <div>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setMachineMode(btn.value as MachineMode)}
                  className={`rounded-xl px-5 py-3 text-sm font-bold sm:px-6 sm:text-base ${
                    machineMode === btn.value
                      ? "bg-[#ff3131] text-white shadow-[0_10px_24px_rgba(255,49,49,0.28)]"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="w-full max-w-xl xl:w-[380px]">
              <input
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                placeholder="Search machine"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#ff3131]"
              />
              <div className="mt-3 flex justify-end">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Results
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {filteredMachines.length} machines found
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredMachines.map((m) => (
              <div key={m.id} className="overflow-hidden rounded-xl border shadow-sm">

                {/* IMAGE FIX */}
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={m.imageSrc}
                    alt={m.title}
                    width={500}
                    height={375}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold">{m.title}</h3>
                  <p className="text-sm text-slate-600">{m.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
