import type { Metadata } from "next";
import UsedMachineryPage from "../../components/UsedMachineryPage";
import { getMachineCatalogData } from "@/lib/machines";
import { buildSeoRoute, getSeoMetadata } from "@/lib/seo";

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

  return getSeoMetadata(
    "/metal-working-machinery",
    {
      title: "Metal Working Machinery",
      description:
        "Explore metal working machinery including turning, milling, boring, drilling, grinding, and CNC equipment from Novatech Machinery.",
      keywords: ["metal working machinery", "used metalworking machines", "industrial metal machines"],
    },
    {
      lookupRoutes: readParam(params.category) || readParam(params.subcategory) ? [aliasRoute] : undefined,
      canonicalRoute: readParam(params.category) || readParam(params.subcategory) ? aliasRoute : "/metal-working-machinery",
    },
  );
}

export default async function MetalWorkingMachineryPage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const params = await searchParams;
  const { machineCategories, machineInventory } = await getMachineCatalogData();

  return (
    <UsedMachineryPage
      machineCategories={machineCategories}
      machineInventory={machineInventory}
      initialCategory={readParam(params.category)}
      initialSubcategory={readParam(params.subcategory)}
      initialMachineId={readParam(params.machine)}
    />
  );
}
 
