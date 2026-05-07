"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  FolderTree,
  Globe,
  ImagePlus,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Package2,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
  LogOut,
} from "lucide-react";

import type {
  AdminCatalogSnapshot,
  AdminCategory,
  AdminDashboardData,
  AdminMachine,
} from "@/lib/admin-catalog.types";
import type { SeoPageRecord, SeoSettings } from "@/lib/seo-settings.types";
import type { SiteSettings } from "@/lib/site-settings.types";

type AdminSection =
  | "dashboard"
  | "machines"
  | "categories"
  | "leads"
  | "seo"
  | "settings";

type CategoryMode = "category" | "subcategory";

type CategoryFormState = {
  id?: string;
  mode: CategoryMode;
  name: string;
  subcategoryName: string;
  parentId: string;
};

type MachineFormState = {
  id?: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  inventoryNumber: string;
  countryOfOrigin: string;
  price: string;
  condition: AdminMachine["condition"];
  stockStatus: AdminMachine["stockStatus"];
  machineType: AdminMachine["machineType"];
  description: string;
  categoryId: string;
  subcategoryId: string;
  specialDeal: boolean;
  images: string[];
  specifications: string;
};

type DeleteModalState = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "danger" | "default";
  action: () => Promise<void>;
};

const defaultCategoryForm: CategoryFormState = {
  mode: "category",
  name: "",
  subcategoryName: "",
  parentId: "",
};

const defaultMachineForm: MachineFormState = {
  name: "",
  brand: "",
  model: "",
  serialNumber: "",
  inventoryNumber: "",
  countryOfOrigin: "",
  price: "",
  condition: "used",
  stockStatus: "available",
  machineType: "conventional",
  description: "",
  categoryId: "",
  subcategoryId: "",
  specialDeal: false,
  images: [],
  specifications: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCategoryName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400"
      />
    </label>
  );
}

function buildSeoKeywords(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");
}

function mergeSeoPage(existingPage: SeoPageRecord | undefined, nextPage: SeoPageRecord) {
  return {
    ...nextPage,
    title: existingPage?.title || nextPage.title,
    description: existingPage?.description || nextPage.description,
    keywords: existingPage?.keywords || nextPage.keywords,
    canonicalUrl: existingPage?.canonicalUrl || nextPage.canonicalUrl,
    ogTitle: existingPage?.ogTitle || nextPage.ogTitle,
    ogDescription: existingPage?.ogDescription || nextPage.ogDescription,
    ogImageUrl: existingPage?.ogImageUrl || nextPage.ogImageUrl,
    noIndex: existingPage?.noIndex ?? nextPage.noIndex,
    noFollow: existingPage?.noFollow ?? nextPage.noFollow,
  };
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        checked ? "border-[#145b93] bg-sky-50 text-[#145b93]" : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-[#145b93]" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [catalog, setCatalog] = useState<AdminCatalogSnapshot | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteSettingsDraft, setSiteSettingsDraft] = useState<SiteSettings | null>(null);
  const [seoDraft, setSeoDraft] = useState<SeoSettings | null>(null);
  const [expandedSeoPageId, setExpandedSeoPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [machineSearch, setMachineSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [machineModalOpen, setMachineModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [machineForm, setMachineForm] = useState<MachineFormState>(defaultMachineForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(defaultCategoryForm);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("");
  const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const seoBaseInitializedRef = useRef(false);

  function requestDeleteConfirmation(config: DeleteModalState) {
    setDeleteModal(config);
  }

  async function confirmDeleteAction() {
    if (!deleteModal) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await deleteModal.action();
      setDeleteModal(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete action failed.");
    } finally {
      setSaving(false);
    }
  }

  async function loadAdminData() {
    setLoading(true);
    setError(null);

    try {
      const [catalogResponse, dashboardResponse, settingsResponse, seoResponse] = await Promise.all([
        fetch("/api/admin/catalog", { cache: "no-store" }),
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/seo", { cache: "no-store" }),
      ]);

      const catalogData = (await catalogResponse.json()) as AdminCatalogSnapshot;
      const dashboardData = (await dashboardResponse.json()) as AdminDashboardData;
      const settingsData = (await settingsResponse.json()) as SiteSettings;
      const seoData = (await seoResponse.json()) as SeoSettings;

      if (!catalogResponse.ok || !dashboardResponse.ok || !settingsResponse.ok || !seoResponse.ok) {
        throw new Error("Admin data could not be loaded.");
      }

      setCatalog(catalogData);
      setDashboard(dashboardData);
      setSiteSettings(settingsData);
      setSiteSettingsDraft(settingsData);
      setSeoDraft(seoData);
      setExpandedSeoPageId((current) => current ?? seoData.pages[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Admin data load failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAdminData();
  }, []);

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMessage(null);
      setError(null);
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [message, error]);

  const topCategories = useMemo(
    () => (catalog?.categories ?? []).filter((item) => !item.parentId).sort((a, b) => a.name.localeCompare(b.name)),
    [catalog],
  );

  const childCategories = useMemo(() => {
    const map = new Map<string, AdminCategory[]>();
    for (const category of catalog?.categories ?? []) {
      if (!category.parentId) {
        continue;
      }
      const current = map.get(category.parentId) ?? [];
      current.push(category);
      map.set(category.parentId, current);
    }

    for (const value of map.values()) {
      value.sort((a, b) => a.name.localeCompare(b.name));
    }

    return map;
  }, [catalog]);

  const machineRows = useMemo(() => {
    if (!catalog) {
      return [] as Array<AdminMachine & { categoryLabel: string; subcategoryLabel?: string }>;
    }

    const categoryIndex = new Map(catalog.categories.map((item) => [item.id, item]));

    return catalog.machines
      .map((machine) => {
        const currentCategory = categoryIndex.get(machine.categoryId);
        const parentCategory = currentCategory?.parentId ? categoryIndex.get(currentCategory.parentId) : undefined;
        return {
          ...machine,
          categoryLabel: parentCategory?.name ?? currentCategory?.name ?? "Unassigned",
          subcategoryLabel: parentCategory ? currentCategory?.name : undefined,
        };
      })
      .filter((machine) => {
        const query = machineSearch.trim().toLowerCase();
        if (!query) {
          return true;
        }

        return [
          machine.name,
          machine.brand,
          machine.model,
          machine.categoryLabel,
          machine.subcategoryLabel,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [catalog, machineSearch]);

  const activeSubcategories = machineForm.categoryId
    ? childCategories.get(machineForm.categoryId) ?? []
    : [];

  const categoryRows = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();

    if (!query) {
      return topCategories;
    }

    return topCategories.filter((category) => {
      const subcategories = childCategories.get(category.id) ?? [];

      return (
        category.name.toLowerCase().includes(query) ||
        subcategories.some((subcategory) => subcategory.name.toLowerCase().includes(query))
      );
    });
  }, [categorySearch, childCategories, topCategories]);

  const categoryDuplicate = useMemo(() => {
    if (!catalog || !categoryForm.name.trim()) {
      return undefined;
    }

    const normalizedName = normalizeCategoryName(categoryForm.name);
    return catalog.categories.find((category) => {
      if (category.id === categoryForm.id) {
        return false;
      }

      return !category.parentId && normalizeCategoryName(category.name) === normalizedName;
    });
  }, [catalog, categoryForm.id, categoryForm.name]);

  const subcategoryDuplicate = useMemo(() => {
    if (!catalog) {
      return undefined;
    }

    const subcategoryName =
      categoryForm.id && categoryForm.mode === "subcategory" ? categoryForm.name : categoryForm.subcategoryName;

    if (!subcategoryName.trim()) {
      return undefined;
    }

    const parentId =
      categoryForm.id && categoryForm.mode === "subcategory"
        ? categoryForm.parentId
        : categoryForm.id && categoryForm.mode === "category"
          ? categoryForm.id
        : categoryDuplicate?.id;

    if (!parentId) {
      return undefined;
    }

    const normalizedName = normalizeCategoryName(subcategoryName);
    return catalog.categories.find((category) => {
      if (category.id === categoryForm.id) {
        return false;
      }

      return category.parentId === parentId && normalizeCategoryName(category.name) === normalizedName;
    });
  }, [catalog, categoryDuplicate, categoryForm]);

  const categoryNameError =
    categoryDuplicate && (categoryForm.mode === "category" || !categoryForm.id)
      ? "This category already exists."
      : null;

  const subcategoryNameError = subcategoryDuplicate
    ? "This subcategory already exists in the selected category."
    : null;

  const categoryParentError =
    categoryForm.id && categoryForm.mode === "subcategory" && !categoryForm.parentId
      ? "Select a parent category first."
      : null;

  const requiresSubcategoryName = Boolean(categoryForm.id && categoryForm.mode === "category");

  const modalSubcategories = useMemo(
    () => (categoryForm.id && categoryForm.mode === "category" ? childCategories.get(categoryForm.id) ?? [] : []),
    [categoryForm.id, categoryForm.mode, childCategories],
  );

  const editingSubcategoryError = useMemo(() => {
    if (!editingSubcategoryId || !editingSubcategoryName.trim()) {
      return null;
    }

    const duplicate = modalSubcategories.find(
      (subcategory) =>
        subcategory.id !== editingSubcategoryId &&
        normalizeCategoryName(subcategory.name) === normalizeCategoryName(editingSubcategoryName),
    );

    return duplicate ? "This subcategory already exists in the selected category." : null;
  }, [editingSubcategoryId, editingSubcategoryName, modalSubcategories]);

  const filteredMetrics = useMemo(
    () => (dashboard?.metrics ?? []).filter((metric) => metric.label !== "Inventory Value"),
    [dashboard],
  );

  const sideMetrics = useMemo(() => {
    const metrics = filteredMetrics.filter((metric) => metric.label !== "Total Machines");
    const availableStock = metrics.find((metric) => metric.label === "Available Stock");
    const remaining = metrics.filter((metric) => metric.label !== "Available Stock");

    return availableStock ? [availableStock, ...remaining] : remaining;
  }, [filteredMetrics]);

  const categoryMachineStats = useMemo(() => {
    if (!catalog) {
      return [] as Array<{
        id: string;
        name: string;
        machineCount: number;
        color: string;
        percent: number;
      }>;
    }

    const palette = [
      "#3b82f6",
      "#fb923c",
      "#60a5fa",
      "#f97316",
      "#0f766e",
      "#ec4899",
      "#8b5cf6",
      "#14b8a6",
      "#f59e0b",
      "#6366f1",
      "#10b981",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
      "#a855f7",
      "#f43f5e",
    ];

    const stats = topCategories
      .map((category, index) => {
        const relatedIds = new Set([
          category.id,
          ...(childCategories.get(category.id) ?? []).map((item) => item.id),
        ]);
        const relatedMachines = (catalog.machines ?? []).filter((machine) =>
          relatedIds.has(machine.categoryId),
        );

        return {
          id: category.id,
          name: category.name,
          machineCount: relatedMachines.length,
          color: palette[index % palette.length],
        };
      })
      .filter((item) => item.machineCount > 0)
      .sort((left, right) => right.machineCount - left.machineCount || left.name.localeCompare(right.name));

    const totalMachines = stats.reduce((sum, item) => sum + item.machineCount, 0) || 1;
    return stats.map((item) => ({
      ...item,
      percent: Math.round((item.machineCount / totalMachines) * 100),
    }));
  }, [catalog, childCategories, topCategories]);

  const categoryChartBars = useMemo(() => {
    return categoryMachineStats;
  }, [categoryMachineStats]);

  const categoryBarMax = useMemo(
    () => Math.max(...categoryChartBars.map((item) => item.machineCount), 1),
    [categoryChartBars],
  );

  const generatedSeoPages = useMemo(() => {
    const companyName = siteSettings?.companyName?.trim() || "Novatech Machinery";
    const existingPagesById = new Map((seoDraft?.pages ?? []).map((page) => [page.id, page]));

    const corePages: SeoPageRecord[] = [
      {
        id: "seo-home",
        label: "Home",
        route: "/",
        title: `Used Industrial Machines in India`,
        description: `${companyName} offers used industrial machines, CNC machines, turning centres, boring mills, and heavy machinery with trusted sourcing and support.`,
        keywords: buildSeoKeywords([
          companyName,
          "used industrial machines",
          "used machinery dealer india",
          "cnc machines india",
          "industrial machinery supplier",
        ]),
        canonicalUrl: "/",
        ogTitle: `${companyName} | Used Industrial Machines`,
        ogDescription: `${companyName} supplies used industrial machinery, CNC machines, and workshop equipment across India.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-about",
        label: "About Us",
        route: "/about",
        title: `About ${companyName}`,
        description: `Learn about ${companyName}, our machinery sourcing experience, industrial trading expertise, and commitment to quality used machines.`,
        keywords: buildSeoKeywords([`about ${companyName}`, "industrial machinery company", "used machinery exporter", "machine dealer profile"]),
        canonicalUrl: "/about",
        ogTitle: `About ${companyName}`,
        ogDescription: `Know more about ${companyName} and our industrial machinery expertise.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-categories",
        label: "Machine Categories",
        route: "/categories",
        title: `Machine Categories | ${companyName}`,
        description: `Browse machine categories including CNC, boring, milling, turning, drilling, grinding, forging, and more industrial equipment.`,
        keywords: buildSeoKeywords(["machine categories", "industrial machine categories", "used cnc categories", "machinery catalogue"]),
        canonicalUrl: "/categories",
        ogTitle: `Machine Categories | ${companyName}`,
        ogDescription: `Explore machinery categories available from ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-contact",
        label: "Contact Us",
        route: "/contact",
        title: `Contact ${companyName} for Industrial Machinery`,
        description: `Contact ${companyName} for used industrial machines, machine quotations, sourcing support, and technical guidance.`,
        keywords: buildSeoKeywords([`contact ${companyName}`, "industrial machine enquiry", "used machinery quote", "buy industrial machine"]),
        canonicalUrl: "/contact",
        ogTitle: `Contact ${companyName}`,
        ogDescription: `Send your machine requirement and get in touch with the ${companyName} team.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-used",
        label: "Used Machinery",
        route: "/used-machinery",
        title: `Used Machinery for Sale | ${companyName}`,
        description: `Explore used machinery for sale including CNC machines, machining centres, turning lathes, boring mills, presses, and other industrial machines.`,
        keywords: buildSeoKeywords(["used machinery for sale", "used cnc machines", "second hand industrial machinery", "used machine inventory"]),
        canonicalUrl: "/used-machinery",
        ogTitle: `Used Machinery for Sale | ${companyName}`,
        ogDescription: `Browse used industrial machinery and send enquiries directly to ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-metal-working",
        label: "Metal Working Machinery",
        route: "/metal-working-machinery",
        title: `Metal Working Machinery | ${companyName}`,
        description: `Browse metal working machinery including turning, milling, boring, drilling, grinding, forming, and sheet metal equipment.`,
        keywords: buildSeoKeywords(["metal working machinery", "metalworking machines", "used metal machinery", "industrial metal machines"]),
        canonicalUrl: "/metal-working-machinery",
        ogTitle: `Metal Working Machinery | ${companyName}`,
        ogDescription: `Professional metal working machinery catalogue from ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-textile",
        label: "Textile Machinery",
        route: "/textile-machinery",
        title: `Textile Machinery | ${companyName}`,
        description: `Find textile machinery solutions with reliable listings, industrial sourcing support, and expert assistance from ${companyName}.`,
        keywords: buildSeoKeywords(["textile machinery", "used textile machines", "industrial textile equipment"]),
        canonicalUrl: "/textile-machinery",
        ogTitle: `Textile Machinery | ${companyName}`,
        ogDescription: `Explore textile machinery listings from ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-plastic",
        label: "Plastic Machinery",
        route: "/plastic-machinery",
        title: `Plastic Machinery | ${companyName}`,
        description: `Discover plastic machinery, processing machines, and industrial equipment with sourcing support from ${companyName}.`,
        keywords: buildSeoKeywords(["plastic machinery", "used plastic machinery", "plastic processing machines"]),
        canonicalUrl: "/plastic-machinery",
        ogTitle: `Plastic Machinery | ${companyName}`,
        ogDescription: `Browse plastic machinery opportunities with ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
      {
        id: "seo-pharma",
        label: "Pharmaceutical Machinery",
        route: "/pharmaceutical-machinery",
        title: `Pharmaceutical Machinery | ${companyName}`,
        description: `Explore pharmaceutical machinery and industrial equipment with trusted support from ${companyName}.`,
        keywords: buildSeoKeywords(["pharmaceutical machinery", "used pharma machines", "pharma equipment"]),
        canonicalUrl: "/pharmaceutical-machinery",
        ogTitle: `Pharmaceutical Machinery | ${companyName}`,
        ogDescription: `Professional pharmaceutical machinery support from ${companyName}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      },
    ];

    const categoryPages = topCategories.map((category) => {
      const childItems = childCategories.get(category.id) ?? [];
      const machineCount = categoryMachineStats.find((item) => item.id === category.id)?.machineCount ?? 0;
      const route = `/used-machinery?category=${category.slug}`;

      return {
        id: `seo-category-${category.slug}`,
        label: category.name,
        route,
        title: `${category.name} for Sale | ${companyName}`,
        description: `Browse ${category.name.toLowerCase()} at ${companyName}. Explore ${machineCount || "available"} used machines, related equipment, and expert sourcing support.`,
        keywords: buildSeoKeywords([
          category.name,
          `${category.name} for sale`,
          `used ${category.name.toLowerCase()}`,
          `${category.name.toLowerCase()} india`,
          companyName,
        ]),
        canonicalUrl: route,
        ogTitle: `${category.name} | ${companyName}`,
        ogDescription: `Explore ${category.name.toLowerCase()} with ${companyName}${childItems.length ? ` including ${childItems.slice(0, 3).map((item) => item.name).join(", ")}` : ""}.`,
        ogImageUrl: "",
        noIndex: false,
        noFollow: false,
      } satisfies SeoPageRecord;
    });

    const subcategoryPages = topCategories.flatMap((category) => {
      const childItems = childCategories.get(category.id) ?? [];

      return childItems.map((subcategory) => {
        const route = `/used-machinery?category=${category.slug}&subcategory=${subcategory.slug}`;
        const machineCount = (catalog?.machines ?? []).filter((machine) => machine.categoryId === subcategory.id).length;

        return {
          id: `seo-subcategory-${category.slug}-${subcategory.slug}`,
          label: subcategory.name,
          route,
          title: `${subcategory.name} for Sale | ${companyName}`,
          description: `Find ${subcategory.name.toLowerCase()} listings at ${companyName}. View used machine options, technical support, and fast enquiry assistance.`,
          keywords: buildSeoKeywords([
            subcategory.name,
            `${subcategory.name} for sale`,
            `used ${subcategory.name.toLowerCase()}`,
            category.name,
            companyName,
          ]),
          canonicalUrl: route,
          ogTitle: `${subcategory.name} | ${companyName}`,
          ogDescription: `${machineCount || "Available"} listings for ${subcategory.name.toLowerCase()} under ${category.name.toLowerCase()}.`,
          ogImageUrl: "",
          noIndex: false,
          noFollow: false,
        } satisfies SeoPageRecord;
      });
    });

    return [...corePages, ...categoryPages, ...subcategoryPages].map((page) =>
      mergeSeoPage(existingPagesById.get(page.id), page),
    );
  }, [catalog?.machines, categoryMachineStats, childCategories, seoDraft?.pages, siteSettings?.companyName, topCategories]);

  useEffect(() => {
    if (!seoDraft || seoBaseInitializedRef.current) {
      return;
    }

    const hasGeneratedCategoryPages = seoDraft.pages.some((page) => page.id.startsWith("seo-category-"));
    if (hasGeneratedCategoryPages || generatedSeoPages.length === 0) {
      seoBaseInitializedRef.current = true;
      return;
    }

    setSeoDraft((current) => (current ? { ...current, pages: generatedSeoPages } : current));
    setExpandedSeoPageId(generatedSeoPages[0]?.id ?? null);
    seoBaseInitializedRef.current = true;
  }, [generatedSeoPages, seoDraft]);

  function openMachineModal(machine?: AdminMachine) {
    if (!catalog || !machine) {
      setMachineForm(defaultMachineForm);
      setMachineModalOpen(true);
      return;
    }

    const currentCategory = catalog.categories.find((item) => item.id === machine.categoryId);
    const parentCategory = currentCategory?.parentId
      ? catalog.categories.find((item) => item.id === currentCategory.parentId)
      : undefined;

    setMachineForm({
      id: machine.id,
      name: machine.name,
      brand: machine.brand ?? "",
      model: machine.model ?? "",
      serialNumber: machine.serialNumber ?? "",
      inventoryNumber: machine.inventoryNumber ?? "",
      countryOfOrigin: machine.countryOfOrigin ?? "",
      price: machine.price ? String(machine.price) : "",
      condition: machine.condition,
      stockStatus: machine.stockStatus,
      machineType: machine.machineType,
      description: machine.description ?? "",
      categoryId: parentCategory?.id ?? currentCategory?.id ?? "",
      subcategoryId: parentCategory ? currentCategory?.id ?? "" : "",
      specialDeal: machine.specialDeal,
      images: machine.images,
      specifications: Object.keys(machine.specifications).length
        ? JSON.stringify(machine.specifications, null, 2)
        : "",
    });
    setMachineModalOpen(true);
  }

  function openCategoryModal(category?: AdminCategory) {
    setError(null);
    setMessage(null);
    setEditingSubcategoryId(null);
    setEditingSubcategoryName("");
    setCategoryForm(
      category
        ? {
            id: category.id,
            mode: category.parentId ? "subcategory" : "category",
            name: category.name,
            subcategoryName: "",
            parentId: category.parentId ?? "",
          }
        : { ...defaultCategoryForm },
    );
    setCategoryModalOpen(true);
  }

  async function saveMachine() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(
        machineForm.id ? `/api/admin/machines/${machineForm.id}` : "/api/admin/machines",
        {
          method: machineForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: machineForm.name,
            brand: machineForm.brand,
            model: machineForm.model,
            serialNumber: machineForm.serialNumber,
            inventoryNumber: machineForm.inventoryNumber,
            countryOfOrigin: machineForm.countryOfOrigin,
            price: machineForm.price ? Number(machineForm.price) : null,
            condition: machineForm.condition,
            stockStatus: machineForm.stockStatus,
            machineType: machineForm.machineType,
            description: machineForm.description,
            categoryId: machineForm.subcategoryId || machineForm.categoryId,
            specialDeal: machineForm.specialDeal,
            images: machineForm.images,
            specifications: machineForm.specifications.trim() ? JSON.parse(machineForm.specifications) : {},
          }),
        },
      );
      const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Machine save failed.");
      }
      setCatalog(data);
      setMachineForm(defaultMachineForm);
      setMachineModalOpen(false);
      setMessage(machineForm.id ? "Machine updated successfully." : "Machine added successfully.");
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Machine save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory() {
    const name = categoryForm.name.trim();
    const subcategoryName = categoryForm.subcategoryName.trim();

    if (!name) {
      setError(categoryForm.id && categoryForm.mode === "subcategory" ? "Enter a subcategory name." : "Enter a category name.");
      return;
    }

    if (requiresSubcategoryName && !subcategoryName) {
      setError("Enter a subcategory name.");
      return;
    }

    if (categoryNameError || subcategoryNameError || categoryParentError) {
      setError(categoryNameError ?? subcategoryNameError ?? categoryParentError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!categoryForm.id) {
        const categoryResponse = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: slugify(name),
            parentId: null,
          }),
        });

        const categoryData = (await categoryResponse.json()) as AdminCatalogSnapshot | { error: string };
        if (!categoryResponse.ok || "error" in categoryData) {
          throw new Error("error" in categoryData ? categoryData.error : "Category save failed.");
        }

        let nextCatalog = categoryData;

        if (subcategoryName) {
          const parentCategory = categoryData.categories.find(
            (category) => !category.parentId && normalizeCategoryName(category.name) === normalizeCategoryName(name),
          );

          if (!parentCategory) {
            throw new Error("Category was saved, but the parent category for the subcategory was not found.");
          }

          const subcategoryResponse = await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: subcategoryName,
              slug: slugify(subcategoryName),
              parentId: parentCategory.id,
            }),
          });

          const subcategoryData = (await subcategoryResponse.json()) as AdminCatalogSnapshot | { error: string };
          if (!subcategoryResponse.ok || "error" in subcategoryData) {
            throw new Error("error" in subcategoryData ? subcategoryData.error : "Subcategory save failed.");
          }

          nextCatalog = subcategoryData;
        }

        setCatalog(nextCatalog);
        setCategoryForm({ ...defaultCategoryForm });
        setCategoryModalOpen(false);
        setMessage(subcategoryName ? "Category and subcategory saved successfully." : "Category saved successfully.");
        await loadAdminData();
        return;
      }

      if (categoryForm.id && categoryForm.mode === "category") {
        const subcategoryResponse = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: subcategoryName,
            slug: slugify(subcategoryName),
            parentId: categoryForm.id,
          }),
        });

        const subcategoryData = (await subcategoryResponse.json()) as AdminCatalogSnapshot | { error: string };
        if (!subcategoryResponse.ok || "error" in subcategoryData) {
          throw new Error("error" in subcategoryData ? subcategoryData.error : "Subcategory save failed.");
        }

        setCatalog(subcategoryData);
        setCategoryForm({ ...defaultCategoryForm });
        setCategoryModalOpen(false);
        setMessage("Subcategory saved successfully.");
        await loadAdminData();
        return;
      }

      const parentId = categoryForm.mode === "subcategory" ? categoryForm.parentId || null : null;
      const response = await fetch(
        categoryForm.id ? `/api/admin/categories/${categoryForm.id}` : "/api/admin/categories",
        {
          method: categoryForm.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: slugify(name),
            parentId,
          }),
        },
      );

      const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Category save failed.");
      }

      setCatalog(data);
      setCategoryForm({ ...defaultCategoryForm });
      setCategoryModalOpen(false);
      setMessage(categoryForm.id ? "Category updated successfully." : "Category saved successfully.");
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Category save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function saveInlineSubcategory() {
    if (!categoryForm.id || !editingSubcategoryId) {
      return;
    }

    const name = editingSubcategoryName.trim();
    if (!name) {
      setError("Enter a subcategory name.");
      return;
    }

    if (editingSubcategoryError) {
      setError(editingSubcategoryError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${editingSubcategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slugify(name),
          parentId: categoryForm.id,
        }),
      });

      const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Subcategory update failed.");
      }

      setCatalog(data);
      setEditingSubcategoryId(null);
      setEditingSubcategoryName("");
      setMessage("Subcategory updated successfully.");
      await loadAdminData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Subcategory update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeSubcategory(id: string, name: string) {
    requestDeleteConfirmation({
      title: `Delete ${name}?`,
      description: "This subcategory will be removed from the admin catalog. Continue only if you are sure.",
      confirmLabel: "Yes, Delete",
      tone: "danger",
      action: async () => {
        const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Subcategory delete failed.");
        }

        setCatalog(data);
        if (editingSubcategoryId === id) {
          setEditingSubcategoryId(null);
          setEditingSubcategoryName("");
        }
        setMessage("Subcategory deleted successfully.");
        await loadAdminData();
      },
    });
  }

  async function removeMachine(id: string, name: string) {
    requestDeleteConfirmation({
      title: `Delete ${name}?`,
      description: "This machine entry, images, and its admin listing references will be removed from the dashboard view.",
      confirmLabel: "Yes, Delete",
      tone: "danger",
      action: async () => {
        const response = await fetch(`/api/admin/machines/${id}`, { method: "DELETE" });
        const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Machine delete failed.");
        }
        setCatalog(data);
        setMessage("Machine deleted successfully.");
        await loadAdminData();
      },
    });
  }

  async function removeCategory(id: string, name: string) {
    requestDeleteConfirmation({
      title: `Delete ${name}?`,
      description: "Deleting a category can affect related subcategories and machine assignments in the admin catalog.",
      confirmLabel: "Yes, Delete",
      tone: "danger",
      action: async () => {
        const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Category delete failed.");
        }
        setCatalog(data);
        setMessage("Category deleted successfully.");
        await loadAdminData();
      },
    });
  }

  async function removeLead(id: string, name: string) {
    requestDeleteConfirmation({
      title: `Delete lead from ${name}?`,
      description: "This enquiry will be removed from the lead inbox and the dashboard metrics will update immediately.",
      confirmLabel: "Yes, Delete",
      tone: "danger",
      action: async () => {
        const response = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
        const data = (await response.json()) as AdminDashboardData | { error: string };
        if (!response.ok || "error" in data) {
          throw new Error("error" in data ? data.error : "Lead delete failed.");
        }

        setDashboard(data);
        setMessage("Lead deleted successfully.");
        await loadAdminData();
      },
    });
  }

  async function saveSiteSettings() {
    if (!siteSettingsDraft) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettingsDraft),
      });
      const data = (await response.json()) as SiteSettings | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Settings save failed.");
      }
      setSiteSettings(data);
      setSiteSettingsDraft(data);
      setMessage("Settings saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Settings save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSeoSettings() {
    if (!seoDraft) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoDraft),
      });
      const data = (await response.json()) as SeoSettings | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "SEO save failed.");
      }
      setSeoDraft(data);
      setMessage("SEO settings saved successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "SEO save failed.");
    } finally {
      setSaving(false);
    }
  }

  function updateSeoPage(
    pageId: string,
    updater: (page: SeoSettings["pages"][number]) => SeoSettings["pages"][number],
  ) {
    setSeoDraft((current) =>
      current
        ? {
            ...current,
            pages: current.pages.map((page) => (page.id === pageId ? updater(page) : page)),
          }
        : current,
    );
  }

  function addSeoPage() {
    const nextPageNumber = (seoDraft?.pages.length ?? 0) + 1;
    const pageId = `seo-page-${Date.now()}`;

    setSeoDraft((current) =>
      current
        ? {
            ...current,
            pages: [
              ...current.pages,
              {
                id: pageId,
                label: `New Page ${nextPageNumber}`,
                route: `/new-page-${nextPageNumber}`,
                title: "",
                description: "",
                keywords: "",
                canonicalUrl: "",
                ogTitle: "",
                ogDescription: "",
                ogImageUrl: "",
                noIndex: false,
                noFollow: false,
              },
            ],
          }
        : current,
    );
    setExpandedSeoPageId(pageId);
  }

  function applyGeneratedSeoBase() {
    setSeoDraft((current) =>
      current
        ? {
            ...current,
            pages: generatedSeoPages,
          }
        : current,
    );
    setExpandedSeoPageId(generatedSeoPages[0]?.id ?? null);
    setMessage("Professional SEO base generated for site pages and machinery categories.");
    setError(null);
  }

  async function handleImageFiles(files: FileList | null) {
    if (!files) return;

    const valid = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const readers = valid.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(new Error(`Unable to read ${file.name}`));
          reader.readAsDataURL(file);
        }),
    );

    try {
      const results = (await Promise.all(readers)).filter(Boolean);
      setMachineForm((current) => ({
        ...current,
        images: [...current.images, ...results],
      }));
    } catch {
      setError("Images could not be uploaded.");
    }
  }

  function makePrimaryImage(index: number) {
    setMachineForm((current) => {
      if (index === 0) return current;
      const updated = [...current.images];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return { ...current, images: updated };
    });
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "machines", label: "Machines", icon: Package2 },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "leads", label: "Leads", icon: Users },
    { id: "seo", label: "SEO", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings2 },
  ] as const;

  if (loading && !catalog) {
    return <div className="p-10 text-center text-slate-500">Loading admin panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0d3f66_0%,#155b92_60%,#2f7fc7_100%)] text-white shadow-[0_16px_30px_rgba(20,91,147,0.24)]">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black">{siteSettings?.companyName ?? "Novatech"}</p>
                <p className="text-sm text-slate-500">{siteSettings?.adminEmail ?? "admin@novatechmachinery.com"}</p>
              </div>
            </div>
          </div>

          <div className="px-3 py-5">
            <p className="px-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">Menu</p>
            <div className="mt-3 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[0.98rem] font-semibold transition ${
                    activeSection === item.id
                      ? "border-[#145b93] bg-sky-50 text-[#145b93]"
                      : "border-transparent text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-[2rem] font-black">
                  {sidebarItems.find((item) => item.id === activeSection)?.label}
                </h1>
                <p className="mt-1 text-sm text-slate-500">Manage full site control from here.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void loadAdminData()}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#10486f]"
                >
                  View Site
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const isStandalone = typeof window !== "undefined" && !window.location.pathname.startsWith("/admin");
                    const logoutUrl = isStandalone ? "/api/auth/logout" : "/api/admin/logout";
                    await fetch(logoutUrl, { method: "POST" });
                    router.replace(isStandalone ? "/login" : "/admin/login");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            {activeSection === "dashboard" && dashboard ? (
              <div className="space-y-6">
                <div className="grid w-full gap-3 xl:grid-cols-[minmax(0,70%)_minmax(0,30%)] xl:items-stretch">
                  <div className="p-1">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div />
                        <div className="text-right">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Total Machines</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">
                            {categoryMachineStats.reduce((sum, item) => sum + item.machineCount, 0)}
                          </p>
                        </div>
                      </div>

                      {categoryChartBars.length ? (
                        <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
                          {categoryChartBars.map((category) => (
                            <div
                              key={category.id}
                              className="grid items-center gap-2.5 rounded-[1rem] bg-white/65 px-3 py-2"
                              style={{ gridTemplateColumns: "minmax(160px, 205px) minmax(0, 1fr) 52px" }}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800">{category.name}</p>
                              </div>

                              <div className="relative h-10 rounded-full bg-slate-100">
                                <div
                                  className="absolute left-0 top-0 h-full rounded-full shadow-[0_10px_24px_rgba(59,130,246,0.16)] transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100, Math.max(4, (category.machineCount / categoryBarMax) * 100))}%`,
                                    background: `linear-gradient(90deg, ${category.color} 0%, ${category.color} 100%)`,
                                  }}
                                />
                              </div>

                              <div className="text-right">
                                <div className="inline-flex min-w-[40px] items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                                  <p className="text-base font-black leading-none text-slate-900">
                                    {category.machineCount}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                          No category machines found yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:h-[560px] xl:grid-cols-1 xl:grid-rows-4 xl:self-stretch">
                    {sideMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fd_100%)] px-4 py-3 text-slate-900 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition-all"
                      >
                        <div className="flex h-full items-center gap-4 pl-2">
                          <div className="flex min-w-0 flex-[0_0_60%] flex-col justify-center">
                            <p className="text-[21px] font-normal leading-8 text-black">
                              {metric.label}
                            </p>
                          </div>
                          <div className="flex flex-[0_0_40%] items-center justify-start">
                            <p className="text-[3.6rem] font-black leading-none text-slate-900">{metric.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Website Messages</p>
                        <h2 className="mt-2 text-xl font-black">Latest enquiries from site</h2>
                      </div>
                      <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-5 space-y-3">
                      {dashboard.recentLeads.slice(0, 5).length ? (
                        dashboard.recentLeads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">{lead.name}</p>
                                <p className="mt-1 text-sm text-slate-500">{lead.machineInterested}</p>
                                <p className="mt-1 text-xs text-slate-400">{lead.email} • {lead.phone}</p>
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {lead.message || "Website enquiry record"}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <p className="text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                                <button
                                  type="button"
                                  onClick={() => void removeLead(lead.id, lead.name)}
                                  disabled={saving}
                                  className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label={`Delete lead from ${lead.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          Website contact and newsletter enquiries will appear here.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">New Machines</p>
                        <h2 className="mt-2 text-xl font-black">Latest 8 machines added</h2>
                      </div>
                      <Package2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-5 max-h-[780px] space-y-3 overflow-y-auto pr-1">
                      {dashboard.recentMachines.slice(0, 8).length ? (
                        dashboard.recentMachines.slice(0, 8).map((machine) => {
                          const machineRow = machineRows.find((item) => item.id === machine.id);

                          return (
                            <div key={machine.id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">{machine.name}</p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    {machineRow?.categoryLabel ?? "Unassigned"}
                                    {machineRow?.subcategoryLabel ? ` • ${machineRow.subcategoryLabel}` : ""}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {machine.brand || machine.model || formatStatusLabel(machine.stockStatus)}
                                  </p>
                                </div>
                                <p className="shrink-0 text-xs text-slate-400">{formatDate(machine.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                          No machines added recently.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "machines" ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:w-80">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={machineSearch}
                      onChange={(event) => setMachineSearch(event.target.value)}
                      placeholder="Search machines..."
                      className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openMachineModal()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Machine
                  </button>
                </div>

                <div className="overflow-x-auto rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-left text-sm text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Brand</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {machineRows.map((machine) => (
                        <tr key={machine.id}>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-18 w-18 overflow-hidden rounded-2xl bg-slate-100">
                                {machine.images[0] ? <Image src={machine.images[0]} alt={machine.name} width={72} height={72} unoptimized className="h-full w-full object-cover" /> : null}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{machine.name}</p>
                                <p className="text-xs text-slate-400">{machine.model || machine.serialNumber || "-"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600">{machine.brand || "-"}</td>
                          <td className="px-4 py-4 text-sm capitalize text-slate-600">{machine.machineType}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div>{machine.categoryLabel}</div>
                            {machine.subcategoryLabel ? <div className="text-xs text-slate-400">{machine.subcategoryLabel}</div> : null}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                              {machine.stockStatus.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => openMachineModal(machine)} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                              <button type="button" onClick={() => void removeMachine(machine.id, machine.name)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeSection === "categories" ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full lg:w-80">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={categorySearch}
                      onChange={(event) => setCategorySearch(event.target.value)}
                      placeholder="Search categories..."
                      className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openCategoryModal()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </div>

                <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-left text-sm text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Subcategories</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {categoryRows.map((category) => (
                        <tr key={category.id}>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">{category.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              {(childCategories.get(category.id) ?? []).map((sub) => (
                                <span key={sub.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                  {sub.name}
                                  <button
                                    type="button"
                                    onClick={() => openCategoryModal(sub)}
                                    className="rounded-full text-slate-500 transition hover:text-[#145b93]"
                                    aria-label={`Edit ${sub.name}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => openCategoryModal(category)} className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil className="h-4 w-4" /></button>
                              <button type="button" onClick={() => void removeCategory(category.id, category.name)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {categoryRows.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">
                            No categories found.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {activeSection === "leads" && dashboard ? (
              <div className="space-y-6">
                <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Lead Inbox</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">Website enquiries</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Contact form, newsletter, and website messages will appear here as soon as visitors submit them.
                    </p>

                    <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(145deg,#0f3b63_0%,#145b93_58%,#2f7fc7_100%)] p-5 text-white shadow-[0_18px_40px_rgba(20,91,147,0.22)]">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-100">Total Leads</p>
                      <p className="mt-3 text-5xl font-black leading-none">{dashboard.recentLeads.length}</p>
                      <p className="mt-3 text-sm leading-6 text-sky-100/90">
                        Latest enquiry records from your live website forms.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">What shows here</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Name, phone number, email, machine interest, message, and enquiry date.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.7rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recent Messages</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">Latest lead records</h2>
                      </div>
                      <MessageSquareQuote className="h-5 w-5 text-slate-400" />
                    </div>

                    {dashboard.recentLeads.length ? (
                      <div className="mt-5 space-y-4">
                        {dashboard.recentLeads.map((lead) => (
                          <div key={lead.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-lg font-black text-slate-900">{lead.name}</p>
                                <p className="mt-1 text-sm text-slate-500">{lead.machineInterested || "General website enquiry"}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <p className="text-xs font-semibold text-slate-400">{formatDate(lead.createdAt)}</p>
                                <button
                                  type="button"
                                  onClick={() => void removeLead(lead.id, lead.name)}
                                  disabled={saving}
                                  className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  aria-label={`Delete lead from ${lead.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Phone</p>
                                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  {lead.phone || "Not provided"}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Email</p>
                                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 break-all">
                                  <Mail className="h-4 w-4 text-slate-400" />
                                  {lead.email || "Not provided"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-[1.3rem] border border-slate-200 bg-white px-4 py-4">
                              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Message</p>
                              <p className="mt-2 text-sm leading-7 text-slate-700">
                                {lead.message || "No message added by the visitor."}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 flex min-h-[360px] items-center justify-center rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                        <div className="max-w-md">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                            <MessageSquareQuote className="h-7 w-7" />
                          </div>
                          <h3 className="mt-5 text-xl font-black text-slate-900">No enquiries yet</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-500">
                            When someone sends a message from the website, their name, phone number, email, machine interest, and message will appear here automatically.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "seo" && seoDraft ? (
              <div className="space-y-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Full Site SEO</p>
                        <h2 className="mt-2 text-2xl font-black">Top-level search settings</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                          Control default metadata, indexing behavior, analytics IDs, and route-wise SEO from one place.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={applyGeneratedSeoBase}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <RefreshCcw className="h-4 w-4" />
                          Build SEO Base
                        </button>
                        <button
                          type="button"
                          onClick={addSeoPage}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Plus className="h-4 w-4" />
                          Add Page
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveSeoSettings()}
                          className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                        >
                          <Save className="h-4 w-4" />
                          Save SEO
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <Field
                        label="Default Title"
                        value={seoDraft.defaultTitle}
                        onChange={(value) => setSeoDraft((current) => current ? { ...current, defaultTitle: value } : current)}
                      />
                      <Field
                        label="Title Suffix"
                        value={seoDraft.globalTitleSuffix}
                        onChange={(value) => setSeoDraft((current) => current ? { ...current, globalTitleSuffix: value } : current)}
                      />
                    </div>
                    <div className="mt-4">
                      <Area
                        label="Default Description"
                        value={seoDraft.defaultDescription}
                        onChange={(value) => setSeoDraft((current) => current ? { ...current, defaultDescription: value } : current)}
                        rows={4}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Configured Pages</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{seoDraft.pages.length}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Top Categories</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">{topCategories.length}</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Subcategory Pages</p>
                        <p className="mt-2 text-3xl font-black text-slate-950">
                          {generatedSeoPages.filter((page) => page.id.startsWith("seo-subcategory-")).length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={applyGeneratedSeoBase}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Update SEO Base
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveSeoSettings()}
                        className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9fd_100%)] p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tracking Stack</p>
                        <h3 className="mt-2 text-xl font-black text-slate-950">Analytics and crawl tools</h3>
                      </div>
                      <div className="rounded-full bg-sky-50 p-3 text-[#145b93]">
                        <Globe className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-6 grid gap-4">
                      <Field
                        label="Google Analytics ID"
                        value={seoDraft.analytics.googleAnalyticsId}
                        onChange={(value) =>
                          setSeoDraft((current) =>
                            current ? { ...current, analytics: { ...current.analytics, googleAnalyticsId: value } } : current,
                          )
                        }
                        placeholder="G-XXXXXXXXXX"
                      />
                      <Field
                        label="Meta Pixel ID"
                        value={seoDraft.analytics.metaPixelId}
                        onChange={(value) =>
                          setSeoDraft((current) =>
                            current ? { ...current, analytics: { ...current.analytics, metaPixelId: value } } : current,
                          )
                        }
                        placeholder="1234567890"
                      />
                      <Field
                        label="Microsoft Clarity ID"
                        value={seoDraft.analytics.clarityProjectId}
                        onChange={(value) =>
                          setSeoDraft((current) =>
                            current ? { ...current, analytics: { ...current.analytics, clarityProjectId: value } } : current,
                          )
                        }
                        placeholder="clarity-project-id"
                      />
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void saveSeoSettings()}
                        className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Page SEO</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950">Page-wise metadata manager</h2>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
                      {seoDraft.pages.length} routes configured
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {seoDraft.pages.map((page) => {
                      const isExpanded = expandedSeoPageId === page.id;
                      const hasTitle = page.title.trim().length > 0;
                      const hasDescription = page.description.trim().length > 0;
                      const hasOg = page.ogTitle.trim().length > 0 || page.ogDescription.trim().length > 0;

                      return (
                        <div
                          key={page.id}
                          className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedSeoPageId((current) => (current === page.id ? null : page.id))}
                            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                                  <Globe className="h-4.5 w-4.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-lg font-black text-slate-950">{page.label || "Untitled Page"}</p>
                                  <p className="mt-1 truncate text-sm text-slate-500">{page.route || "/"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasTitle ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-white text-slate-400"}`}>
                                Title {hasTitle ? "✓" : ""}
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasDescription ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-white text-slate-400"}`}>
                                Desc {hasDescription ? "✓" : ""}
                              </span>
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasOg ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-white text-slate-400"}`}>
                                OG {hasOg ? "✓" : ""}
                              </span>
                              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm">
                                <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                              </span>
                            </div>
                          </button>

                          {isExpanded ? (
                            <div className="border-t border-slate-200 bg-white px-5 py-5">
                              <div className="grid gap-4 xl:grid-cols-2">
                                <Field
                                  label="Page Label"
                                  value={page.label}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, label: value }))}
                                />
                                <Field
                                  label="Route"
                                  value={page.route}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, route: value }))}
                                  placeholder="/about"
                                />
                                <Field
                                  label="Meta Title"
                                  value={page.title}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, title: value }))}
                                />
                                <Field
                                  label="Canonical URL"
                                  value={page.canonicalUrl}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, canonicalUrl: value }))}
                                  placeholder="https://..."
                                />
                              </div>

                              <div className="mt-4">
                                <Area
                                  label="Meta Description"
                                  value={page.description}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, description: value }))}
                                  rows={4}
                                />
                              </div>

                              <div className="mt-4">
                                <Field
                                  label="Meta Keywords"
                                  value={page.keywords}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, keywords: value }))}
                                  placeholder="industrial machines, used machinery, cnc machines"
                                />
                              </div>

                              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                                <Field
                                  label="OG Title"
                                  value={page.ogTitle}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, ogTitle: value }))}
                                />
                                <Field
                                  label="OG Image URL"
                                  value={page.ogImageUrl}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, ogImageUrl: value }))}
                                  placeholder="https://..."
                                />
                              </div>

                              <div className="mt-4">
                                <Area
                                  label="OG Description"
                                  value={page.ogDescription}
                                  onChange={(value) => updateSeoPage(page.id, (current) => ({ ...current, ogDescription: value }))}
                                  rows={3}
                                />
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <ToggleField
                                  label="No Index"
                                  checked={page.noIndex}
                                  onChange={(checked) => updateSeoPage(page.id, (current) => ({ ...current, noIndex: checked }))}
                                />
                                <ToggleField
                                  label="No Follow"
                                  checked={page.noFollow}
                                  onChange={(checked) => updateSeoPage(page.id, (current) => ({ ...current, noFollow: checked }))}
                                />
                              </div>

                              <div className="mt-5 flex flex-wrap justify-between gap-3">
                                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  Route SEO Ready
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void saveSeoSettings()}
                                  className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10486f]"
                                >
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "settings" && siteSettingsDraft ? (
              <div className="space-y-6">
                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">Settings</h2>
                      <p className="mt-1 text-sm text-slate-500">Store profile, SMTP, and analytics settings here.</p>
                    </div>
                    <button type="button" onClick={() => void saveSiteSettings()} className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]">
                      <Save className="h-4 w-4" />
                      Save Settings
                    </button>
                  </div>

                  <div className="mt-6 grid gap-6">
                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-lg font-black">Profile Information</h3>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <Field label="Full Name" value={siteSettingsDraft.adminProfile.fullName} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, adminProfile: { ...current.adminProfile, fullName: value } } : current)} />
                        <Field label="Phone" value={siteSettingsDraft.adminProfile.phone} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, adminProfile: { ...current.adminProfile, phone: value } } : current)} />
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-lg font-black">SMTP Settings</h3>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <Field label="SMTP Host" value={siteSettingsDraft.operations.smtp.host} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, host: value } } } : current)} />
                        <Field label="SMTP Port" value={siteSettingsDraft.operations.smtp.port} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, port: value } } } : current)} />
                        <Field label="SMTP Username / Email" value={siteSettingsDraft.operations.smtp.username} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, username: value } } } : current)} />
                        <Field label="SMTP Password / App Password" type="password" value={siteSettingsDraft.operations.smtp.password} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, password: value } } } : current)} />
                        <Field label="From Email" value={siteSettingsDraft.operations.smtp.fromEmail} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, fromEmail: value } } } : current)} />
                        <Field label="From Name" value={siteSettingsDraft.operations.smtp.fromName} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, fromName: value } } } : current)} />
                        <Field label="Send Test Email" value={siteSettingsDraft.operations.smtp.testEmail} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, testEmail: value } } } : current)} />
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-lg font-black">Analytics & Tracking</h3>
                      <div className="mt-4 grid gap-4 lg:grid-cols-3">
                        <Field label="Google Analytics Measurement ID" value={siteSettingsDraft.operations.analytics.googleAnalyticsId} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, analytics: { ...current.operations.analytics, googleAnalyticsId: value } } } : current)} />
                        <Field label="Meta Pixel ID" value={siteSettingsDraft.operations.analytics.metaPixelId} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, analytics: { ...current.operations.analytics, metaPixelId: value } } } : current)} />
                        <Field label="Microsoft Clarity Project ID" value={siteSettingsDraft.operations.analytics.clarityProjectId} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, analytics: { ...current.operations.analytics, clarityProjectId: value } } } : current)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {categoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-[1.6rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">
                {categoryForm.id
                  ? categoryForm.mode === "subcategory"
                    ? "Edit Subcategory"
                    : "Add Subcategory"
                  : "Add Category"}
              </h3>
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {!categoryForm.id ? (
                <>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Add Category Name
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                      className={`rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-slate-400 ${
                        categoryNameError ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-200"
                      }`}
                    />
                    {categoryNameError ? <span className="text-xs font-semibold text-rose-600">{categoryNameError}</span> : null}
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Add Subcategory Name
                    <input
                      type="text"
                      value={categoryForm.subcategoryName}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, subcategoryName: event.target.value }))}
                      className={`rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-slate-400 ${
                        subcategoryNameError ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-200"
                      }`}
                    />
                    {subcategoryNameError ? <span className="text-xs font-semibold text-rose-600">{subcategoryNameError}</span> : null}
                  </label>
                </>
              ) : categoryForm.mode === "category" ? (
                <>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Category Name
                    <input
                      type="text"
                      value={categoryForm.name}
                      readOnly
                      className="cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                    />
                  </label>

                  <div className="grid gap-2">
                    <p className="text-sm font-medium text-slate-700">Subcategories</p>
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      {modalSubcategories.length ? (
                        modalSubcategories.map((subcategory) => {
                          const isEditing = editingSubcategoryId === subcategory.id;

                          return (
                            <div key={subcategory.id} className="rounded-xl border border-slate-200 bg-white p-2">
                              {isEditing ? (
                                <div className="grid gap-2">
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editingSubcategoryName}
                                      onChange={(event) => setEditingSubcategoryName(event.target.value)}
                                      className={`min-w-0 flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 ${
                                        editingSubcategoryError ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-200"
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => void saveInlineSubcategory()}
                                      disabled={saving || !editingSubcategoryName.trim() || Boolean(editingSubcategoryError)}
                                      className="rounded-xl bg-[#145b93] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#10486f] disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                      Save
                                    </button>
                                  </div>
                                  {editingSubcategoryError ? <span className="text-xs font-semibold text-rose-600">{editingSubcategoryError}</span> : null}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{subcategory.name}</span>
                                  <div className="flex shrink-0 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSubcategoryId(subcategory.id);
                                        setEditingSubcategoryName(subcategory.name);
                                        setError(null);
                                      }}
                                      className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                                      aria-label={`Edit ${subcategory.name}`}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void removeSubcategory(subcategory.id, subcategory.name)}
                                      className="rounded-full border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"
                                      aria-label={`Delete ${subcategory.name}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-sm text-slate-500">
                          No subcategories yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    New Subcategory Name
                    <input
                      type="text"
                      value={categoryForm.subcategoryName}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, subcategoryName: event.target.value }))}
                      className={`rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-slate-400 ${
                        subcategoryNameError ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-200"
                      }`}
                    />
                    {subcategoryNameError ? <span className="text-xs font-semibold text-rose-600">{subcategoryNameError}</span> : null}
                  </label>
                </>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Type
                    <select
                      value={categoryForm.mode}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, mode: event.target.value as CategoryMode, parentId: event.target.value === "category" ? "" : current.parentId }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400"
                    >
                      <option value="category">Category</option>
                      <option value="subcategory">Subcategory</option>
                    </select>
                  </label>

                  {categoryForm.mode === "subcategory" ? (
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Select Category
                      <select
                        value={categoryForm.parentId}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, parentId: event.target.value }))}
                        className={`rounded-2xl border bg-white px-4 py-3 outline-none focus:border-slate-400 ${
                          categoryParentError ? "border-rose-300 bg-rose-50/50" : "border-slate-200"
                        }`}
                      >
                        <option value="">Choose category</option>
                        {topCategories.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {categoryParentError ? <span className="text-xs font-semibold text-rose-600">{categoryParentError}</span> : null}
                    </label>
                  ) : null}

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    {categoryForm.mode === "subcategory" ? "Subcategory Name" : "Category Name"}
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                      className={`rounded-2xl border bg-white px-4 py-3 outline-none transition focus:border-slate-400 ${
                        categoryNameError || subcategoryNameError ? "border-rose-300 bg-rose-50/50 text-rose-900" : "border-slate-200"
                      }`}
                    />
                    {categoryNameError ? <span className="text-xs font-semibold text-rose-600">{categoryNameError}</span> : null}
                    {subcategoryNameError ? <span className="text-xs font-semibold text-rose-600">{subcategoryNameError}</span> : null}
                  </label>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
              <button
                type="button"
                onClick={() => void saveCategory()}
                disabled={
                  saving ||
                  Boolean(categoryNameError) ||
                  Boolean(subcategoryNameError) ||
                  Boolean(categoryParentError) ||
                  !categoryForm.name.trim() ||
                  (requiresSubcategoryName && !categoryForm.subcategoryName.trim())
                }
                className="rounded-full bg-[#145b93] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#10486f] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {machineModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[1.7rem] bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-[1.8rem] font-black">{machineForm.id ? "Edit Machine" : "Add Machine"}</h3>
              <button type="button" onClick={() => setMachineModalOpen(false)} className="rounded-full border border-slate-200 p-2 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Name" value={machineForm.name} onChange={(value) => setMachineForm((current) => ({ ...current, name: value }))} />
              <Field label="Brand" value={machineForm.brand} onChange={(value) => setMachineForm((current) => ({ ...current, brand: value }))} />
              <Field label="Model" value={machineForm.model} onChange={(value) => setMachineForm((current) => ({ ...current, model: value }))} />
              <Field label="Serial Number" value={machineForm.serialNumber} onChange={(value) => setMachineForm((current) => ({ ...current, serialNumber: value }))} />
              <Field label="Inventory Number" value={machineForm.inventoryNumber} onChange={(value) => setMachineForm((current) => ({ ...current, inventoryNumber: value }))} />
              <Field label="Country of Origin" value={machineForm.countryOfOrigin} onChange={(value) => setMachineForm((current) => ({ ...current, countryOfOrigin: value }))} />
              <Field label="Price" type="number" value={machineForm.price} onChange={(value) => setMachineForm((current) => ({ ...current, price: value }))} />

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Category
                <select value={machineForm.categoryId} onChange={(event) => setMachineForm((current) => ({ ...current, categoryId: event.target.value, subcategoryId: "" }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400">
                  <option value="">Select category</option>
                  {topCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Subcategory
                <select value={machineForm.subcategoryId} onChange={(event) => setMachineForm((current) => ({ ...current, subcategoryId: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400">
                  <option value="">None</option>
                  {activeSubcategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Condition
                <select value={machineForm.condition} onChange={(event) => setMachineForm((current) => ({ ...current, condition: event.target.value as AdminMachine["condition"] }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400">
                  <option value="used">Used</option>
                  <option value="new">New</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Stock Status
                <select value={machineForm.stockStatus} onChange={(event) => setMachineForm((current) => ({ ...current, stockStatus: event.target.value as AdminMachine["stockStatus"] }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400">
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="in_maintenance">In Maintenance</option>
                  <option value="in_transit">In Transit</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Machine Type
                <select value={machineForm.machineType} onChange={(event) => setMachineForm((current) => ({ ...current, machineType: event.target.value as AdminMachine["machineType"] }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400">
                  <option value="conventional">Conventional</option>
                  <option value="cnc">CNC</option>
                </select>
              </label>
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={machineForm.specialDeal} onChange={(event) => setMachineForm((current) => ({ ...current, specialDeal: event.target.checked }))} />
              Show in Special Deals
            </label>

            <div className="mt-4 grid gap-4">
              <Area label="Description" value={machineForm.description} onChange={(value) => setMachineForm((current) => ({ ...current, description: value }))} rows={4} />
              <Area label="Specifications JSON" value={machineForm.specifications} onChange={(value) => setMachineForm((current) => ({ ...current, specifications: value }))} rows={5} placeholder='{"Max Diameter":"800mm"}' />

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Machine Images</p>
                    <p className="text-xs text-slate-500">Click the box to open the file manager. You can select multiple images.</p>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                    <ImagePlus className="h-4 w-4" />
                    Select Images
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex h-52 w-full items-center justify-center rounded-[1.4rem] border-2 border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-sky-300 hover:bg-sky-50"
                >
                  <span className="flex flex-col items-center gap-3">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-semibold">Click to open file manager</span>
                    <span className="text-xs">PNG, JPG, WebP multiple images</span>
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => void handleImageFiles(event.target.files)}
                />

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {machineForm.images.map((image, index) => (
                    <div key={`${image.slice(0, 20)}-${index}`} className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white">
                      <div className="aspect-[5/4] bg-slate-100">
                        <Image src={image} alt={`Machine ${index + 1}`} width={560} height={448} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="space-y-2 px-3 py-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black uppercase tracking-[0.16em] ${index === 0 ? "text-sky-700" : "text-slate-400"}`}>{index === 0 ? "Main Image" : `Image ${index + 1}`}</span>
                          <button type="button" onClick={() => setMachineForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} className="text-rose-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => makePrimaryImage(index)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Make First</button>
                          {index > 0 ? (
                            <button
                              type="button"
                              onClick={() => setMachineForm((current) => {
                                const updated = [...current.images];
                                const temp = updated[index - 1];
                                updated[index - 1] = updated[index];
                                updated[index] = temp;
                                return { ...current, images: updated };
                              })}
                              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Move Up
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setMachineModalOpen(false)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={() => void saveMachine()} className="rounded-full bg-[#145b93] px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving..." : "Save Machine"}</button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.75rem] bg-white px-6 py-6 shadow-[0_35px_100px_rgba(2,6,23,0.34)]">
            <div className="flex items-center gap-3 text-black">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black">Are you sure to delete?</h3>
                <p className="mt-1 text-sm text-slate-600">{deleteModal.title}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  disabled={saving}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDeleteAction()}
                  disabled={saving}
                  className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Deleting..." : deleteModal.confirmLabel}
                </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
