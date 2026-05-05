"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  MessageCircle,
  Phone,
  Search,
  X,
} from "lucide-react";
import type { MachineCategory, MachineItem } from "@/lib/machines";

type MachineMode = "all" | "conventional" | "cnc";

type MetalWorkingCatalogueProps = {
  machineCategories: MachineCategory[];
  machineInventory: MachineItem[];
  initialCategory?: string | null;
  initialSubcategory?: string | null;
  initialMachineId?: string | null;
};

export default function MetalWorkingCatalogue({
  machineCategories,
  machineInventory,
  initialCategory = null,
  initialSubcategory = null,
  initialMachineId = null,
}: MetalWorkingCatalogueProps) {
  const router = useRouter();
  const pathname = usePathname();

  function matchesCategoryValue(category: MachineCategory, value: string | null) {
    if (!value) {
      return false;
    }

    return category.name === value || category.slug === value;
  }

  const machineById = useMemo(
    () => new Map(machineInventory.map((machine) => [machine.id, machine] as const)),
    [machineInventory]
  );

  const subcategoryToCategory = useMemo(
    () =>
      new Map(
        machineCategories.flatMap((cat) =>
          (cat.sub ?? []).map((sub) => [sub, cat.name] as const)
        )
      ),
    [machineCategories]
  );

  const initialSelectedMachine = initialMachineId ? machineById.get(initialMachineId) ?? null : null;
  const matchedInitialCategory =
    machineCategories.find((category) => matchesCategoryValue(category, initialCategory))?.name ?? null;
  const initialSelectedCategory =
    initialSelectedMachine?.category ??
    (initialSubcategory ? subcategoryToCategory.get(initialSubcategory) : null) ??
    matchedInitialCategory;
  const initialResolvedSubcategory = initialSelectedMachine?.subcategory ?? initialSubcategory;

  const [categorySearch, setCategorySearch] = useState("");
  const [machineSearch, setMachineSearch] = useState("");
  const [sortBy] = useState<"newest" | "a-z">("newest");
  const [machineMode, setMachineMode] = useState<MachineMode>("all");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
  const [canScrollThumbnailsLeft, setCanScrollThumbnailsLeft] = useState(false);
  const [canScrollThumbnailsRight, setCanScrollThumbnailsRight] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialSelectedCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(initialResolvedSubcategory);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(initialMachineId);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        machineCategories.map((c) => [c.name, c.name === initialSelectedCategory])
      )
  );

  const selectedMachine = selectedMachineId ? machineById.get(selectedMachineId) ?? null : null;
  const activeFilters = [selectedCategory, selectedSubcategory].filter(Boolean) as string[];

  const filteredSidebarCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();

    if (!q) {
      return machineCategories;
    }

    return machineCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        category.sub?.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categorySearch, machineCategories]);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        machineCategories.map((category) => [
          category.name,
          machineInventory.filter((machine) => machine.category === category.name).length,
        ])
      ),
    [machineCategories, machineInventory]
  );

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
  }, [machineInventory, machineMode, selectedCategory, selectedSubcategory, machineSearch, sortBy]);

  const machinesPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / machinesPerPage));
  const paginatedMachines = useMemo(() => {
    const start = (currentPage - 1) * machinesPerPage;
    return filteredMachines.slice(start, start + machinesPerPage);
  }, [currentPage, filteredMachines]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 320);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!thumbnailStripRef.current || typeof window === "undefined") {
      return;
    }

    const strip = thumbnailStripRef.current;

    function updateThumbnailScrollState() {
      const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
      setCanScrollThumbnailsLeft(strip.scrollLeft > 8);
      setCanScrollThumbnailsRight(maxScrollLeft - strip.scrollLeft > 8);
    }

    updateThumbnailScrollState();
    strip.addEventListener("scroll", updateThumbnailScrollState, { passive: true });
    window.addEventListener("resize", updateThumbnailScrollState);

    return () => {
      strip.removeEventListener("scroll", updateThumbnailScrollState);
      window.removeEventListener("resize", updateThumbnailScrollState);
    };
  }, [selectedMachineId, selectedMachine?.images?.length]);

  function toggleCategory(name: string) {
    setOpenCategories((prev) =>
      Object.fromEntries(
        machineCategories.map((category) => [category.name, category.name === name ? !prev[name] : false])
      )
    );
  }

  function toggleSubcategory(sub: string) {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setSelectedSubcategory((cur) => (cur === sub ? null : sub));
    setSelectedCategory(subcategoryToCategory.get(sub) ?? null);
    setIsMobileSidebarOpen(false);
  }

  function handleCategoryClick(categoryName: string, hasChildren: boolean) {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);

    if (hasChildren) {
      toggleCategory(categoryName);
      return;
    }

    setOpenCategories(() =>
      Object.fromEntries(machineCategories.map((category) => [category.name, false]))
    );
    setIsMobileSidebarOpen(false);
  }

  function handleAllMachinesClick() {
    setSelectedMachineId(null);
    setCurrentPage(1);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setOpenCategories(() =>
      Object.fromEntries(machineCategories.map((category) => [category.name, false]))
    );
    setIsMobileSidebarOpen(false);
    router.push(pathname);
  }

  function clearCategoryFilter(filter: string) {
    setSelectedMachineId(null);
    setCurrentPage(1);

    if (selectedSubcategory === filter) {
      setSelectedSubcategory(null);
      return;
    }

    if (selectedCategory === filter) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setOpenCategories(() =>
        Object.fromEntries(machineCategories.map((category) => [category.name, false]))
      );
    }
  }

  const toolbarButtons = [
    { label: "All Machines", value: "all" },
    { label: "Conventional Machines", value: "conventional" },
    { label: "CNC Machines", value: "cnc" },
  ];

  function handleMachineModeChange(value: MachineMode) {
    setCurrentPage(1);
    setMachineMode(value);
    setSelectedMachineId(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setOpenCategories(() =>
      Object.fromEntries(machineCategories.map((category) => [category.name, false]))
    );
    router.push(pathname);
  }

  function handleMachineSearchChange(value: string) {
    setCurrentPage(1);
    setMachineSearch(value);
  }

  function openMachine(machineId: string, category?: string, subcategory?: string) {
    setSelectedMachineId(machineId);
    setActiveImageIndex(0);

    if (category) {
      setSelectedCategory(category);
    }

    setSelectedSubcategory(subcategory ?? null);

    const params = new URLSearchParams();

    if (category) {
      const resolvedCategory = machineCategories.find((item) => item.name === category);
      params.set("category", resolvedCategory?.slug ?? category);
    }

    if (subcategory) {
      params.set("subcategory", subcategory);
    }

    params.set("machine", machineId);

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleBackToResults() {
    setSelectedMachineId(null);

    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (selectedSubcategory) {
      params.set("subcategory", selectedSubcategory);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToResultsTop() {
    if (!resultsTopRef.current) {
      return;
    }

    const top = resultsTopRef.current.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }

  const backLabel = selectedSubcategory ?? selectedCategory ?? "All Machines";
  const machineDetailGallery = selectedMachine
    ? (selectedMachine.images?.length ? selectedMachine.images : [selectedMachine.imageSrc]).map((src, index) => ({
        id: `${selectedMachine.id}-thumb-${index}`,
        src,
        alt: `${selectedMachine.title} view ${index + 1}`,
        position:
          selectedMachine.imagePositions?.[index] ??
          selectedMachine.imagePosition ??
          (index % 2 === 0 ? "center" : "55% center"),
      }))
    : [];

  const machineDetailDescription = selectedMachine
    ? [selectedMachine.description]
    : [];

  const machineSpecifications = selectedMachine
    ? (
        selectedMachine.specifications && selectedMachine.specifications.length > 0
          ? selectedMachine.specifications
          : [
        { label: "Manufacturer", value: selectedMachine.manufacturer },
        { label: "Model", value: selectedMachine.model },
        { label: "Condition", value: selectedMachine.condition },
        { label: "Serial / Stock Number", value: selectedMachine.stockNumber },
        { label: "Category", value: selectedMachine.category },
        { label: "Subcategory", value: selectedMachine.subcategory ?? "General Machinery" },
        { label: "Machine Type", value: selectedMachine.machineType.toUpperCase() },
        { label: "Location", value: selectedMachine.location },
        { label: "Support", value: selectedMachine.support },
      ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value))
      )
    : [];

  const activeGalleryImage =
    machineDetailGallery[activeImageIndex] ?? machineDetailGallery[0] ?? null;

  function selectGalleryImage(index: number) {
    setActiveImageIndex(index);
  }

  function scrollThumbnailStrip(direction: "left" | "right") {
    if (!thumbnailStripRef.current) {
      return;
    }

    const scrollAmount = thumbnailStripRef.current.clientWidth * 0.7;
    thumbnailStripRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full px-3 pb-12 pt-6 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
      <div className="border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/">Home</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-900">Machines</span>
          {selectedMachine ? (
            <>
              <span>&gt;</span>
              <span className="font-semibold text-slate-900">{selectedMachine.title}</span>
            </>
          ) : null}
        </div>

        <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-950 sm:text-[2.5rem] lg:text-[3rem]">
          Metal Working Machinery
        </h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          Browse our complete inventory of premium industrial machines
        </p>

        <div className="mt-4">
          <div className="min-w-0">
            {activeFilters.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 px-4 py-3 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-[#145b93]">
                    <span>{activeFilters.length} Filters Active</span>
                    <button
                      type="button"
                      onClick={handleAllMachinesClick}
                      className="normal-case tracking-normal text-slate-500 transition hover:text-[#145b93]"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.75rem] font-black uppercase tracking-[0.18em] text-slate-500">
                      Filters:
                    </span>
                    {activeFilters.map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => clearCategoryFilter(filter)}
                        className="inline-flex items-center gap-2 border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-[#145b93] transition hover:border-[#145b93]"
                      >
                        <span>{filter}</span>
                        <span className="text-base leading-none">×</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleAllMachinesClick}
                      className="text-sm font-medium text-slate-500 transition hover:text-[#145b93]"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-[minmax(220px,25%)_minmax(0,1fr)] lg:grid-cols-[minmax(240px,20%)_minmax(0,1fr)]">
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((current) => !current)}
            className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#145b93] bg-white text-[#145b93] shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label={isMobileSidebarOpen ? "Close category sidebar" : "Open category sidebar"}
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>

        <aside
          className={`border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] md:sticky md:top-20 md:flex md:max-h-[calc(100vh-10rem)] md:flex-col md:self-start md:overflow-hidden lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100vh-10rem)] lg:flex-col lg:self-start lg:overflow-hidden ${
            isMobileSidebarOpen ? "block" : "hidden"
          } md:flex`}
        >
          <div className="border-b border-slate-200 px-2 pb-3">
            <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#145b93]">
              Category
            </p>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-[2px] border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="mt-3 max-h-[500px] min-h-0 space-y-2 overflow-y-auto pr-1 pb-2 lg:max-h-none lg:flex-1">
            {filteredSidebarCategories.map((cat) => {
              const isOpen = openCategories[cat.name];
              const hasChildren = !!cat.sub?.length;
              const isCategoryActive = selectedCategory === cat.name && !selectedSubcategory;
              const isParentHighlighted = selectedCategory === cat.name;
              const categoryCount = categoryCounts[cat.name] ?? 0;

              return (
                <div
                  key={cat.name}
                  className="overflow-hidden rounded-[2px] border border-slate-200 bg-white transition"
                >
                  <button
                    onClick={() => handleCategoryClick(cat.name, hasChildren)}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition ${
                      isCategoryActive
                        ? "bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white"
                        : isOpen
                          ? "bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white"
                          : "text-slate-800 hover:bg-slate-50 hover:text-[#145b93]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="text-[0.92rem] leading-5">{cat.name}</span>
                    </span>

                    <span className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isCategoryActive || isOpen ? "text-white/85" : "text-slate-400"
                        }`}
                      >
                        {categoryCount}
                      </span>

                      {hasChildren && (
                        <ChevronDown
                          className={`h-4.5 w-4.5 shrink-0 transition ${
                            isOpen ? "rotate-180" : ""
                          } ${isCategoryActive || isOpen ? "text-white" : "text-slate-500"}`}
                        />
                      )}
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? "max-h-[520px] border-t border-slate-200 px-3 py-2" : "max-h-0"
                    }`}
                  >
                    <div className="bg-white">
                      {cat.sub?.map((sub) => {
                        const isSubActive = selectedSubcategory === sub;

                        return (
                          <button
                            key={sub}
                            onClick={() => toggleSubcategory(sub)}
                            className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                              isSubActive
                                ? "bg-sky-50 font-semibold text-[#145b93]"
                                : isParentHighlighted
                                  ? "text-slate-700 hover:bg-slate-50 hover:text-[#145b93]"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-[#145b93]"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                  isSubActive ? "bg-[#145b93]" : "bg-slate-300"
                                }`}
                              />
                              <span>{sub}</span>
                            </span>
                            <span className={`text-xs ${isSubActive ? "text-[#145b93]" : "text-slate-400"}`}>
                              {
                                machineInventory.filter(
                                  (machine) => machine.category === cat.name && machine.subcategory === sub
                                ).length
                              }
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* PRODUCTS */}
        {selectedMachine ? (
          <div className="min-w-0 overflow-hidden border border-slate-200 bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-5 lg:p-6">
            <div className="mb-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => handleMachineModeChange(btn.value as MachineMode)}
                  className={`min-h-11 rounded-[2px] border px-3 py-2 text-[0.82rem] font-bold leading-tight transition sm:px-4 ${
                    machineMode === btn.value
                      ? "border-[#145b93] bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-800"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleBackToResults}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {backLabel}
            </button>

            <div className="mt-5 min-w-0">
              <div className="mb-4 min-w-0 border border-slate-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <p className="break-words text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#145b93] sm:text-[0.72rem] sm:tracking-[0.18em]">
                    {selectedMachine.machineType.toUpperCase()}
                    {selectedMachine.subcategory ? ` / ${selectedMachine.subcategory}` : ` / ${selectedMachine.category}`}
                  </p>
                  <h3 className="mt-1.5 break-words text-[1.25rem] font-semibold leading-tight text-slate-950 sm:text-[1.55rem] lg:text-[1.7rem]">
                    {selectedMachine.title}
                  </h3>
                </div>

                <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-3 lg:gap-3">
                  <a
                    href="https://wa.me/919646255855"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 border border-[#145b93] bg-[#145b93] px-3 py-2 text-center text-sm font-semibold leading-tight text-white transition hover:bg-[#0f4c7c]"
                  >
                    <CircleDollarSign className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-words">Request Price</span>
                  </a>
                  <a
                    href="https://wa.me/919646255855"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-[#145b93] hover:text-[#145b93]"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-words">WhatsApp</span>
                  </a>
                  <a
                    href="tel:+919646255855"
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold leading-tight text-slate-800 transition hover:border-[#145b93] hover:text-[#145b93]"
                  >
                    <Phone className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 break-words">Call Now</span>
                  </a>
                </div>
              </div>

              <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
                <div className="min-w-0">
                  <div className="min-w-0">
                    <div className="overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="flex h-[220px] w-full items-center justify-center overflow-hidden bg-white sm:h-[320px] md:h-[360px] lg:h-[420px]">
                        <Image
                          src={activeGalleryImage?.src ?? selectedMachine.imageSrc}
                          alt={activeGalleryImage?.alt ?? selectedMachine.imageAlt}
                          width={1400}
                          height={920}
                          priority
                          unoptimized
                          quality={100}
                          sizes="(min-width: 1280px) 55vw, 100vw"
                          className="h-full w-full object-contain"
                          style={{ objectPosition: "center" }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-[2px] border border-slate-200 bg-white p-2">
                      <div className="relative">
                        {machineDetailGallery.length > 5 && canScrollThumbnailsLeft ? (
                          <button
                            type="button"
                            onClick={() => scrollThumbnailStrip("left")}
                            className="absolute left-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50/95 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition hover:border-[#145b93] hover:text-[#145b93]"
                            aria-label="Scroll thumbnails left"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                        ) : null}

                        <div
                          ref={thumbnailStripRef}
                          className="grid grid-flow-col auto-cols-[72px] gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] sm:auto-cols-[96px] [&::-webkit-scrollbar]:hidden"
                        >
                          {machineDetailGallery.map((image, index) => (
                            <button
                              key={image.id}
                              type="button"
                              onClick={() => selectGalleryImage(index)}
                              className={`overflow-hidden border bg-white transition hover:border-[#145b93] ${
                                index === activeImageIndex ? "border-[#145b93]" : "border-slate-200"
                              }`}
                            >
                              <Image
                                src={image.src}
                                alt={image.alt}
                                width={150}
                                height={110}
                                loading="eager"
                                className="h-[72px] w-[72px] object-cover sm:h-20 sm:w-24"
                                style={{ objectPosition: image.position }}
                              />
                            </button>
                          ))}
                        </div>

                        {machineDetailGallery.length > 5 && canScrollThumbnailsRight ? (
                          <button
                            type="button"
                            onClick={() => scrollThumbnailStrip("right")}
                            className="absolute right-2 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50/95 text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition hover:border-[#145b93] hover:text-[#145b93]"
                            aria-label="Scroll thumbnails right"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex flex-col gap-4 xl:h-full">
                  <div
                    className="min-w-0 border border-slate-200 bg-white p-3 sm:p-5 xl:flex xl:flex-col xl:overflow-hidden"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-[0.9rem] font-semibold uppercase tracking-[0.08em] text-slate-950 sm:text-[0.98rem]">
                        Specifications
                      </span>
                      <span className="h-[2px] flex-1 bg-[#145b93]" />
                    </div>

                    <div className="min-w-0 overflow-hidden xl:flex-1 xl:overflow-y-auto">
                      {machineSpecifications.map((spec, index) => (
                        <div
                          key={`${spec.label}-${index}`}
                          className={`grid min-w-0 grid-cols-1 gap-1 px-2 py-2.5 sm:grid-cols-[minmax(130px,0.9fr)_minmax(0,1.1fr)] sm:px-3 ${
                            index === 0 ? "" : "border-t border-slate-200"
                          }`}
                        >
                          <span className="min-w-0 break-words text-[0.92rem] font-semibold leading-6 text-slate-500 sm:text-[0.95rem]">{spec.label}</span>
                          <span className="min-w-0 break-words text-[0.92rem] font-semibold leading-6 text-slate-900 sm:text-[0.95rem]">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-4 min-w-0 border border-slate-200 bg-white p-3 sm:p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="text-[0.98rem] font-semibold uppercase tracking-[0.08em] text-slate-950">
                  Description
                </span>
                <span className="h-[2px] flex-1 bg-[#145b93]" />
              </div>

              <div className="min-w-0 space-y-2.5 break-words text-[0.95rem] leading-7 text-slate-600 sm:text-[0.98rem]">
                {machineDetailDescription.length > 0 ? (
                  machineDetailDescription.map((line) => (
                    <p key={line}>{line}</p>
                  ))
                ) : (
                  <p>Please contact Novatech for complete machine details.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div ref={resultsTopRef} />
            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.value}
                  type="button"
                  onClick={() => handleMachineModeChange(btn.value as MachineMode)}
                  className={`rounded-[2px] border px-4 py-2 text-[0.82rem] font-bold transition ${
                    machineMode === btn.value
                      ? "border-[#145b93] bg-[linear-gradient(135deg,#145b93_0%,#2f7fc7_45%,#0d4b80_100%)] text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-800"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:justify-end">
                <p className="text-sm font-medium text-slate-600 sm:order-1 lg:text-right">
                  <span className="font-semibold text-slate-900">{filteredMachines.length}</span> results
                </p>
                <div className="relative w-full sm:order-2 sm:w-[290px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={machineSearch}
                    onChange={(e) => handleMachineSearchChange(e.target.value)}
                    placeholder="Search machines..."
                    className="w-full rounded-[2px] border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#145b93] focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedMachines.length > 0 ? (
                paginatedMachines.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openMachine(m.id, m.category, m.subcategory)}
                    className="overflow-hidden border border-slate-200 bg-white text-left shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_18px_34px_rgba(20,91,147,0.1)]"
                  >
                    <div className="w-full overflow-hidden">
                      <Image
                        src={m.imageSrc}
                        alt={m.title}
                        width={500}
                        height={375}
                        className="h-[270px] w-full object-cover transition duration-500 hover:scale-[1.03] sm:h-[300px]"
                        style={{ objectPosition: m.imagePosition ?? "center" }}
                      />
                    </div>

                    <div className="border-t border-slate-200 p-4 text-center">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#145b93]">
                        {m.machineType.toUpperCase()}
                        {m.subcategory ? ` - ${m.subcategory.toUpperCase()}` : ` - ${m.category.toUpperCase()}`}
                      </p>
                      <h3 className="mt-2 line-clamp-2 min-h-[3.1rem] text-[1.03rem] font-semibold uppercase leading-6 text-slate-950">
                        {m.title}
                      </h3>
                      {m.location ? (
                        <p className="mt-1 text-sm uppercase tracking-[0.06em] text-slate-400">
                          {m.location}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))
              ) : (
                <div className="sm:col-span-2 xl:col-span-3">
                  <div className="border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-slate-600">
                    No machines found in the database for the current filters.
                  </div>
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => {
                        setCurrentPage(page);
                        scrollToResultsTop();
                      }}
                      className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-bold transition ${
                        currentPage === page
                          ? "border-[#145b93] bg-[#145b93] text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-[#145b93] hover:text-[#145b93]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}

      </div>

      {showScrollTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#145b93] text-white shadow-[0_14px_30px_rgba(20,91,147,0.28)] transition hover:bg-[#0f4c7c] lg:hidden"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      ) : null}
    </section>
  );
}
