import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UsedMachineryPage from "../../components/UsedMachineryPage";
import JsonLd from "@/components/seo/JsonLd";
import { getMachineCatalogData } from "@/lib/machines";
import { filterMachinesForSelection, resolveCatalogSelection } from "@/lib/catalog-seo";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbListSchema, getItemListSchema, getProductSchema } from "@/lib/seo/schema";
import { getMachinePath } from "@/lib/machine-urls";

type SearchParamsInput = Promise<{
  category?: string | string[];
  subcategory?: string | string[];
  machine?: string | string[];
  q?: string | string[];
}>;

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
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
  const { categoryRows, machineInventory } = await getMachineCatalogData();
  const selection = resolveCatalogSelection(category, subcategory, categoryRows, machineInventory);
  const aliasRoute = buildSeoRoute("/used-machinery", {
    category,
    subcategory,
    machine,
  });
  const categoryAliasRoute = buildSeoRoute("/used-machinery", { category, subcategory });
  const machineAliasRoute = buildSeoRoute("/used-machinery", { machine });

  return generatePageMetadata("/metal-working-machinery", {
    fallbackTitle: category || subcategory ? selection.heading : "Metal Working Machinery",
    fallbackDescription: category || subcategory
      ? selection.description
      : "Explore metal working machinery including turning, milling, boring, drilling, grinding, and CNC equipment from Novatech Machinery.",
    fallbackKeywords: [
      "metal working machinery",
      "used metalworking machines",
      "industrial metal machines",
    ],
    lookupRoutes: [
      ...(machine ? [aliasRoute, machineAliasRoute] : []),
      ...(category || subcategory ? [categoryAliasRoute] : []),
    ],
    canonicalRoute: machine
      ? getMachinePath(machine)
      : category || subcategory
        ? categoryAliasRoute
        : "/metal-working-machinery",
    noIndex: Boolean(machine || q || category || subcategory || !selection.isValid),
  });
}

export default async function MetalWorkingMachineryPage({
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
    : "/metal-working-machinery";
  const canonicalRoute = selection.subcategory
    ? buildSeoRoute("/used-machinery", {
        category: selection.category?.slug,
        subcategory: selection.subcategory.slug,
      })
    : categoryRoute;
  const breadcrumbItems = selection.category
    ? [
        { name: "Home", path: "/" },
        { name: "Used Machinery", path: "/used-machinery" },
        { name: selection.category.name, path: categoryRoute },
        ...(selection.subcategory
          ? [{ name: selection.subcategory.name, path: canonicalRoute }]
          : []),
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Metal Working Machinery", path: "/metal-working-machinery" },
      ];
  const filteredMachines = filterMachinesForSelection(machineInventory, selection);
  const [breadcrumbSchema, itemListSchema, productSchema] = await Promise.all([
    getBreadcrumbListSchema(breadcrumbItems),
    !selectedMachine && !q
      ? getItemListSchema(
          canonicalRoute,
          selection.category ? selection.heading : "Metal Working Machinery",
          filteredMachines.slice(0, 12).map((item) => ({
            name: item.title,
            url: getMachinePath(item),
          })),
        )
      : null,
    selectedMachine ? getProductSchema(selectedMachine) : null,
  ]);

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
        initialSearchQuery={q}
        pageHeading="Metal Working Machinery"
      />
    </>
  );
}
 
