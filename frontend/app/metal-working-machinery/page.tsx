import MachineCard from "../../components/Cards/MachineCard";
import Footer from "../../components/Footer";
import MetalWorkingCatalogue from "../../components/MetalWorkingCatalogue";
import SiteHeader from "../../components/SiteHeader";

export default function MetalWorkingMachineryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SiteHeader />

      <main>
        <MetalWorkingCatalogue />
      </main>

      <MachineCard
        title="Looking for a Specific Machine?"
        description="Tell us what you need and we'll find the right machine at the best price."
      />
      <Footer />
    </div>
  );
}
