import type { Metadata } from "next";
import UsedMachineryPage from "@/components/UsedMachineryPage";
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
  const route = buildSeoRoute("/used-machinery", {
    category: readParam(params.category),
    subcategory: readParam(params.subcategory),
  });

  return getSeoMetadata(route, {
    title: "Used Machinery for Sale",
    description:
      "Browse used machinery for sale including CNC machines, machining centres, lathes, boring mills, and industrial equipment.",
    keywords: ["used machinery for sale", "used cnc machines", "industrial machines inventory"],
  });
}

export default async function UsedMachineryRoutePage({
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
