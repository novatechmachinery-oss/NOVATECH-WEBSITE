import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UsedMachineryPage from "@/components/UsedMachineryPage";
import JsonLd from "@/components/seo/JsonLd";
import type { MachineMode } from "@/components/MetalWorkingCatalogue";
import { getMachineCatalogData } from "@/lib/machines";
import { filterMachinesForSelection, resolveCatalogSelection } from "@/lib/catalog-seo";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbListSchema, getItemListSchema, getProductSchema } from "@/lib/seo/schema";
import { getMachinePath } from "@/lib/machine-urls";

type SearchParamsInput = Promise<{
  category?: string | string[];
  subcategory?: string | string[];
  machine?: string | string[];
  mode?: string | string[];
  q?: string | string[];
}>;

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function readMachineMode(value: string | string[] | undefined): MachineMode | null {
  if (value === "cnc" || value === "conventional" || value === "all") {
    return value;
  }

  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = readParam(params.category);
  const subcategory = readParam(params.subcategory);
  const machine = readParam(params.machine);
  const q = readParam(params.q);
  const mode = readParam(params.mode);
  const { categoryRows, machineInventory } = await getMachineCatalogData();
  const selection = resolveCatalogSelection(category, subcategory, categoryRows, machineInventory);
  const route = buildSeoRoute("/used-machinery", {
    category,
    subcategory,
    machine,
  });
  const categoryRoute = buildSeoRoute("/used-machinery", { category, subcategory });
  const machineRoute = buildSeoRoute("/used-machinery", { machine });

  return generatePageMetadata(route, {
    fallbackTitle: selection.heading,
    fallbackDescription: selection.description,
    fallbackKeywords: [
      "used machinery for sale",
      "used cnc machines",
      "industrial machines inventory",
    ],
    lookupRoutes: [
      ...(machine ? [machineRoute] : []),
      ...(category || subcategory ? [categoryRoute] : []),
    ],
    canonicalRoute: machine
      ? getMachinePath(machine)
      : category || subcategory
        ? categoryRoute
        : "/used-machinery",
    noIndex: Boolean(machine || q || mode || !selection.isValid),
  });
}

export default async function UsedMachineryRoutePage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const params = await searchParams;
  const category = readParam(params.category);
  const subcategory = readParam(params.subcategory);
  const machine = readParam(params.machine);
  const q = readParam(params.q);
  const { categoryRows, machineCategories, machineInventory } = await getMachineCatalogData();
  const selection = resolveCatalogSelection(category, subcategory, categoryRows, machineInventory);
  const selectedMachine = machine
    ? machineInventory.find((item) => item.id === machine) ?? null
    : null;

  if ((machine && !selectedMachine) || ((category || subcategory) && !selection.isValid)) {
    notFound();
  }

  const categoryRoute = selection.category
    ? buildSeoRoute("/used-machinery", { category: selection.category.slug })
    : "/used-machinery";
  const canonicalRoute = selection.subcategory
    ? buildSeoRoute("/used-machinery", {
        category: selection.category?.slug,
        subcategory: selection.subcategory.slug,
      })
    : categoryRoute;
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Used Machinery", path: "/used-machinery" },
    ...(selection.category
      ? [{ name: selection.category.name, path: categoryRoute }]
      : []),
    ...(selection.subcategory
      ? [{ name: selection.subcategory.name, path: canonicalRoute }]
      : []),
  ];
  const filteredMachines = filterMachinesForSelection(machineInventory, selection);
  const [breadcrumbSchema, itemListSchema, productSchema] = await Promise.all([
    getBreadcrumbListSchema(breadcrumbItems),
    !selectedMachine && !q
      ? getItemListSchema(
          canonicalRoute,
          selection.heading,
          filteredMachines.slice(0, 12).map((item) => ({
            name: item.title,
            url: getMachinePath(item),
          })),
        )
      : null,
    selectedMachine ? getProductSchema(selectedMachine) : null,
  ]);
  const breadcrumbs = breadcrumbItems.map((item) => ({ name: item.name, href: item.path }));

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {itemListSchema ? <JsonLd data={itemListSchema} /> : null}
      {productSchema ? <JsonLd data={productSchema} /> : null}
      <UsedMachineryPage
        machineCategories={machineCategories}
        machineInventory={machineInventory}
        initialCategory={category}
        initialSubcategory={subcategory}
        initialMachineId={machine}
        initialMachineMode={readMachineMode(params.mode)}
        initialSearchQuery={q}
        pageHeading={selection.heading}
        pageDescription={selection.description}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
