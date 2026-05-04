"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  FolderTree,
  ImagePlus,
  LayoutDashboard,
  Package2,
  Pencil,
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
} from "lucide-react";

import type {
  AdminCatalogSnapshot,
  AdminCategory,
  AdminDashboardData,
  AdminMachine,
} from "@/lib/admin-catalog.types";
import type { SeoSettings } from "@/lib/seo-settings.types";
import type { SiteSettings } from "@/lib/site-settings.types";

type AdminSection =
  | "dashboard"
  | "machines"
  | "categories"
  | "leads"
  | "homepage"
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

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
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

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [catalog, setCatalog] = useState<AdminCatalogSnapshot | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteSettingsDraft, setSiteSettingsDraft] = useState<SiteSettings | null>(null);
  const [seoDraft, setSeoDraft] = useState<SeoSettings | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function confirmDelete(label: string) {
    if (typeof window === "undefined") {
      return false;
    }

    return window.confirm(`Are you sure you want to delete this ${label}?`);
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

  async function removeSubcategory(id: string) {
    if (!confirmDelete("subcategory")) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
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
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Subcategory delete failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMachine(id: string) {
    if (!confirmDelete("machine")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/machines/${id}`, { method: "DELETE" });
      const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Machine delete failed.");
      }
      setCatalog(data);
      setMessage("Machine deleted successfully.");
      await loadAdminData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Machine delete failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id: string) {
    if (!confirmDelete("category")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = (await response.json()) as AdminCatalogSnapshot | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Category delete failed.");
      }
      setCatalog(data);
      setMessage("Category deleted successfully.");
      await loadAdminData();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Category delete failed.");
    } finally {
      setSaving(false);
    }
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
              </div>
            </div>
          </div>

          <div className="p-6">
            {message ? <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            {activeSection === "dashboard" && dashboard ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {dashboard.metrics.map((metric, index) => (
                    <div key={metric.label} className={`rounded-[1.6rem] border p-5 shadow-sm ${index === 0 ? "border-sky-200 bg-[linear-gradient(135deg,#0d3f66_0%,#155b92_60%,#2f7fc7_100%)] text-white" : "border-slate-200 bg-white"}`}>
                      <p className={`text-xs font-black uppercase tracking-[0.2em] ${index === 0 ? "text-sky-100" : "text-slate-400"}`}>{metric.label}</p>
                      <p className="mt-3 text-3xl font-black">{metric.label === "Inventory Value" ? `Rs ${money(metric.value)}` : metric.value}</p>
                      <p className={`mt-2 text-sm ${index === 0 ? "text-sky-100/90" : "text-slate-500"}`}>{metric.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Performance</p>
                        <h2 className="mt-2 text-xl font-black">Category wise machine graph</h2>
                      </div>
                      <BarChart3 className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-6 space-y-4">
                      {dashboard.categories.map((category) => (
                        <div key={category.id}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{category.name}</p>
                              <p className="text-xs text-slate-400">{category.subcategoryCount} subcategories</p>
                            </div>
                            <p className="text-sm font-bold text-slate-700">{category.machineCount}</p>
                          </div>
                          <div className="h-3 rounded-full bg-slate-100">
                            <div className="h-3 rounded-full bg-[linear-gradient(90deg,#145b93_0%,#2f7fc7_100%)]" style={{ width: `${category.barWidth}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Today</p>
                      <h2 className="mt-2 text-xl font-black">{dashboard.machinesAddedToday} machines added today</h2>
                      <div className="mt-4 space-y-3">
                        {dashboard.todayMachines.length > 0 ? dashboard.todayMachines.map((machine) => (
                          <div key={machine.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="font-semibold text-slate-900">{machine.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(machine.createdAt)}</p>
                          </div>
                        )) : <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No machines have been added today.</p>}
                      </div>
                    </div>

                    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recent Leads</p>
                      <div className="mt-4 space-y-3">
                        {dashboard.recentLeads.length > 0 ? dashboard.recentLeads.map((lead) => (
                          <div key={lead.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="font-semibold text-slate-900">{lead.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{lead.machineInterested}</p>
                            <p className="mt-1 text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                          </div>
                        )) : <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No leads have been received yet.</p>}
                      </div>
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
                              <button type="button" onClick={() => void removeMachine(machine.id)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
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
                              <button type="button" onClick={() => void removeCategory(category.id)} className="rounded-full border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
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
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Recent Leads</p>
                    <p className="mt-3 text-3xl font-black">{dashboard.recentLeads.length}</p>
                    <p className="mt-2 text-sm text-slate-500">Latest enquiries from contact form</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {dashboard.recentLeads.map((lead) => (
                    <div key={lead.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{lead.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{lead.email}</p>
                          <p className="mt-1 text-sm text-slate-500">{lead.phone}</p>
                        </div>
                        <p className="text-xs text-slate-400">{formatDate(lead.createdAt)}</p>
                      </div>
                      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        Interested in: {lead.machineInterested}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeSection === "homepage" && siteSettingsDraft ? (
              <div className="space-y-6">
                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">Homepage Settings</h2>
                      <p className="mt-1 text-sm text-slate-500">Manage hero content, cards, navigation strip, and CTA text here.</p>
                    </div>
                    <button type="button" onClick={() => void saveSiteSettings()} className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]">
                      <Save className="h-4 w-4" />
                      Save Homepage
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <Field label="Company Name" value={siteSettingsDraft.companyName} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, companyName: value } : current)} />
                    <Field label="Company Tagline" value={siteSettingsDraft.companyTagline} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, companyTagline: value } : current)} />
                    <Field label="Special Deals Heading" value={siteSettingsDraft.home.sectionTitle} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, home: { ...current.home, sectionTitle: value } } : current)} />
                    <Field label="CTA Title" value={siteSettingsDraft.home.machineCtaTitle} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, home: { ...current.home, machineCtaTitle: value } } : current)} />
                  </div>

                  <div className="mt-4">
                    <Area label="CTA Description" value={siteSettingsDraft.home.machineCtaDescription} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, home: { ...current.home, machineCtaDescription: value } } : current)} rows={4} />
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Area
                      label="Hero Slides JSON"
                      value={JSON.stringify(siteSettingsDraft.home.heroSlides, null, 2)}
                      onChange={(value) => {
                        try {
                          setSiteSettingsDraft((current) => current ? { ...current, home: { ...current.home, heroSlides: JSON.parse(value) } } : current);
                        } catch {}
                      }}
                      rows={8}
                    />
                    <Area
                      label="Homepage Feature Cards JSON"
                      value={JSON.stringify(siteSettingsDraft.home.featureCards, null, 2)}
                      onChange={(value) => {
                        try {
                          setSiteSettingsDraft((current) => current ? { ...current, home: { ...current.home, featureCards: JSON.parse(value) } } : current);
                        } catch {}
                      }}
                      rows={10}
                    />
                    <Area
                      label="Top Navigation Strip JSON"
                      value={JSON.stringify(siteSettingsDraft.navigation.categoryLinks, null, 2)}
                      onChange={(value) => {
                        try {
                          setSiteSettingsDraft((current) => current ? { ...current, navigation: { ...current.navigation, categoryLinks: JSON.parse(value) } } : current);
                        } catch {}
                      }}
                      rows={8}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeSection === "seo" && seoDraft ? (
              <div className="space-y-6">
                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">SEO Management</h2>
                      <p className="mt-1 text-sm text-slate-500">Manage global metadata and page-specific SEO here.</p>
                    </div>
                    <button type="button" onClick={() => void saveSeoSettings()} className="inline-flex items-center gap-2 rounded-full bg-[#145b93] px-4 py-3 text-sm font-semibold text-white hover:bg-[#10486f]">
                      <Save className="h-4 w-4" />
                      Save SEO
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <Field label="Default Title" value={seoDraft.defaultTitle} onChange={(value) => setSeoDraft((current) => current ? { ...current, defaultTitle: value } : current)} />
                    <Field label="Title Suffix" value={seoDraft.globalTitleSuffix} onChange={(value) => setSeoDraft((current) => current ? { ...current, globalTitleSuffix: value } : current)} />
                  </div>
                  <div className="mt-4">
                    <Area label="Default Description" value={seoDraft.defaultDescription} onChange={(value) => setSeoDraft((current) => current ? { ...current, defaultDescription: value } : current)} />
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Field label="Google Analytics ID" value={seoDraft.analytics.googleAnalyticsId} onChange={(value) => setSeoDraft((current) => current ? { ...current, analytics: { ...current.analytics, googleAnalyticsId: value } } : current)} />
                    <Field label="Meta Pixel ID" value={seoDraft.analytics.metaPixelId} onChange={(value) => setSeoDraft((current) => current ? { ...current, analytics: { ...current.analytics, metaPixelId: value } } : current)} />
                    <Field label="Microsoft Clarity ID" value={seoDraft.analytics.clarityProjectId} onChange={(value) => setSeoDraft((current) => current ? { ...current, analytics: { ...current.analytics, clarityProjectId: value } } : current)} />
                  </div>
                </div>

                <div className="space-y-4">
                  {seoDraft.pages.map((page, index) => (
                    <div key={page.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <Field label="Page Label" value={page.label} onChange={(value) => setSeoDraft((current) => current ? { ...current, pages: current.pages.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) } : current)} />
                        <Field label="Route" value={page.route} onChange={(value) => setSeoDraft((current) => current ? { ...current, pages: current.pages.map((item, itemIndex) => itemIndex === index ? { ...item, route: value } : item) } : current)} />
                        <Field label="Title" value={page.title} onChange={(value) => setSeoDraft((current) => current ? { ...current, pages: current.pages.map((item, itemIndex) => itemIndex === index ? { ...item, title: value } : item) } : current)} />
                        <Field label="Keywords" value={page.keywords} onChange={(value) => setSeoDraft((current) => current ? { ...current, pages: current.pages.map((item, itemIndex) => itemIndex === index ? { ...item, keywords: value } : item) } : current)} />
                      </div>
                      <div className="mt-4">
                        <Area label="Description" value={page.description} onChange={(value) => setSeoDraft((current) => current ? { ...current, pages: current.pages.map((item, itemIndex) => itemIndex === index ? { ...item, description: value } : item) } : current)} rows={3} />
                      </div>
                    </div>
                  ))}
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
                        <Field label="SMTP Password / App Password" value={siteSettingsDraft.operations.smtp.password} onChange={(value) => setSiteSettingsDraft((current) => current ? { ...current, operations: { ...current.operations, smtp: { ...current.operations.smtp, password: value } } } : current)} />
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
                                      onClick={() => void removeSubcategory(subcategory.id)}
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
    </div>
  );
}
