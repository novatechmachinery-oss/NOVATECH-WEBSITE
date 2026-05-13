import type { Metadata } from "next";
import UsedMachineryPage from "../../components/UsedMachineryPage";
import { getMachineCatalogData } from "@/lib/machines";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

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
  const aliasRoute = buildSeoRoute("/used-machinery", {
    category: readParam(params.category),
    subcategory: readParam(params.subcategory),
  });

  return generatePageMetadata("/metal-working-machinery", {
    fallbackTitle: "Metal Working Machinery",
    fallbackDescription:
      "Explore metal working machinery including turning, milling, boring, drilling, grinding, and CNC equipment from Novatech Machinery.",
    fallbackKeywords: [
      "metal working machinery",
      "used metalworking machines",
      "industrial metal machines",
    ],
    lookupRoutes:
      readParam(params.category) || readParam(params.subcategory)
        ? [aliasRoute]
        : undefined,
    canonicalRoute:
      readParam(params.category) || readParam(params.subcategory)
        ? aliasRoute
        : "/metal-working-machinery",
  });
}

export default async function MetalWorkingMachineryPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const params = await searchParams;
  const route = buildSeoRoute("/metal-working-machinery", {
    category: readParam(params.category),
    subcategory: readParam(params.subcategory),
  });
  const [{ machineCategories, machineInventory }, breadcrumbSchema] = await Promise.all([
    getMachineCatalogData(),
    getBreadcrumbSchema(route),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <UsedMachineryPage
        machineCategories={machineCategories}
        machineInventory={machineInventory}
        initialCategory={readParam(params.category)}
        initialSubcategory={readParam(params.subcategory)}
        initialMachineId={readParam(params.machine)}
      />
    </>
  );
}
 
