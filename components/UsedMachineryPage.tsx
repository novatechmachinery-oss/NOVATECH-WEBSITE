import MachineCard from "./Cards/MachineCard";
import Footer from "./Footer";
import MetalWorkingCatalogue, { type MachineMode } from "./MetalWorkingCatalogue";
import SiteHeader from "./SiteHeader";
import type { MachineCategory, MachineItem } from "@/lib/machines";

type UsedMachineryPageProps = {
  machineCategories: MachineCategory[];
  machineInventory: MachineItem[];
  initialCategory?: string | null;
  initialSubcategory?: string | null;
  initialMachineId?: string | null;
  initialMachineMode?: MachineMode | null;
  initialSearchQuery?: string | null;
  pageHeading?: string;
};

export default function UsedMachineryPage({
  machineCategories,
  machineInventory,
  initialCategory = null,
  initialSubcategory = null,
  initialMachineId = null,
  initialMachineMode = null,
  initialSearchQuery = null,
  pageHeading = "Metal Working Machinery",
}: UsedMachineryPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main>
        <MetalWorkingCatalogue
          key={`${initialCategory ?? ""}:${initialSubcategory ?? ""}:${initialMachineId ?? ""}:${initialMachineMode ?? ""}:${initialSearchQuery ?? ""}`}
          machineCategories={machineCategories}
          machineInventory={machineInventory}
          initialCategory={initialCategory}
          initialSubcategory={initialSubcategory}
          initialMachineId={initialMachineId}
          initialMachineMode={initialMachineMode}
          initialSearchQuery={initialSearchQuery}
          pageHeading={pageHeading}
        />
      </main>

      {!initialMachineId ? (
        <MachineCard
          title="Need a Specific Machine?"
          description="Browse the full catalogue and connect with Novatech on WhatsApp for quick help."
        />
      ) : null}
      <Footer />
    </div>
  );
}
 