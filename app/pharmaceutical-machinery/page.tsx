import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/pharmaceutical-machinery", {
    title: "Pharmaceutical Machinery",
    description:
      "Browse pharmaceutical machinery for tablet, capsule, filling, processing, and packaging operations.",
    keywords: ["pharmaceutical machinery", "used pharma machines", "pharma equipment"],
  });
}

export default function PharmaceuticalMachineryPage() {
  return (
    <ComingSoonPage
      title="Pharmaceutical Machinery"
      tag="Pharma"
      description="This section is being prepared for tablet, capsule, filling, processing, and packaging machinery listings."
    />
  );
}
