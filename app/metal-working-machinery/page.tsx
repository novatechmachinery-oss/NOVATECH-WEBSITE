import type { Metadata } from "next";
import UsedMachineryPage from "../../components/UsedMachineryPage";
import { getMachineCatalogData } from "@/lib/machines";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema, getProductSchema } from "@/lib/seo/schema";

type SearchParamsInput = Promise<{
  category?: string | string[];
  subcategory?: string | string[];
  machine?: string | string[];
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
  const aliasRoute = buildSeoRoute("/used-machinery", {
    category,
    subcategory,
    machine,
  });
  const categoryAliasRoute = buildSeoRoute("/used-machinery", { category, subcategory });
  const machineAliasRoute = buildSeoRoute("/used-machinery", { machine });

  return generatePageMetadata("/metal-working-machinery", {
    fallbackTitle: "Metal Working Machinery",
    fallbackDescription:
      "Explore metal working machinery including turning, milling, boring, drilling, grinding, and CNC equipment from Novatech Machinery.",
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
      ? machineAliasRoute
      : category || subcategory
        ? categoryAliasRoute
        : "/metal-working-machinery",
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
  const route = buildSeoRoute("/metal-working-machinery", {
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
      />
    </>
  );
}
 
