import UsedMachineryPage from "../../components/UsedMachineryPage";
import { getMachineCatalogData } from "@/lib/machines";

type SearchParamsInput = Promise<{
  category?: string | string[];
  subcategory?: string | string[];
  machine?: string | string[];
}>;

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
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
