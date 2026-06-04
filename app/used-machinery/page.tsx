import type { Metadata } from "next";
import UsedMachineryPage from "@/components/UsedMachineryPage";
import type { MachineMode } from "@/components/MetalWorkingCatalogue";
import { getMachineCatalogData } from "@/lib/machines";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema, getProductSchema } from "@/lib/seo/schema";

type SearchParamsInput = Promise<{
  category?: string | string[];
  subcategory?: string | string[];
  machine?: string | string[];
  mode?: string | string[];
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
  const route = buildSeoRoute("/used-machinery", {
    category,
    subcategory,
    machine,
  });
  const categoryRoute = buildSeoRoute("/used-machinery", { category, subcategory });
  const machineRoute = buildSeoRoute("/used-machinery", { machine });

  return generatePageMetadata(route, {
    fallbackTitle: "Used Machinery for Sale",
    fallbackDescription:
      "Browse used machinery for sale including CNC machines, machining centres, lathes, boring mills, and industrial equipment.",
    fallbackKeywords: [
      "used machinery for sale",
      "used cnc machines",
      "industrial machines inventory",
    ],
    lookupRoutes: [
      ...(machine ? [machineRoute] : []),
      ...(category || subcategory ? [categoryRoute] : []),
    ],
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
  const route = buildSeoRoute("/used-machinery", {
    category,
    subcategory,
    machine,
  });
  const [{ machineCategories, machineInventory }, breadcrumbSchema] = await Promise.all([
    getMachineCatalogData(),
    getBreadcrumbSchema(route),
  ]);
  const selectedMachine = machine
    ? machineInventory.find((item) => item.id === machine) ?? null
    : null;
  const productSchema = selectedMachine ? await getProductSchema(selectedMachine) : null;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {productSchema ? (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}
      <UsedMachineryPage
        machineCategories={machineCategories}
        machineInventory={machineInventory}
        initialCategory={category}
        initialSubcategory={subcategory}
        initialMachineId={machine}
        initialMachineMode={readMachineMode(params.mode)}
        pageHeading="All Machines"
      />
    </>
  );
}
