import type { Metadata } from "next";
import UsedMachineryPage from "@/components/UsedMachineryPage";
import { getMachineCatalogData } from "@/lib/machines";
import { buildSeoRoute, generatePageMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/schema";

export const dynamic = "force-dynamic";

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
  const route = buildSeoRoute("/used-machinery", {
    category: readParam(params.category),
    subcategory: readParam(params.subcategory),
  });

  return generatePageMetadata(route, {
    fallbackTitle: "Used Machinery for Sale",
    fallbackDescription:
      "Browse used machinery for sale including CNC machines, machining centres, lathes, boring mills, and industrial equipment.",
    fallbackKeywords: [
      "used machinery for sale",
      "used cnc machines",
      "industrial machines inventory",
    ],
  });
}

export default async function UsedMachineryRoutePage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const params = await searchParams;
  const route = buildSeoRoute("/used-machinery", {
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
