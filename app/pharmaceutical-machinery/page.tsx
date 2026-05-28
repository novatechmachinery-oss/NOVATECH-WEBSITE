import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/pharmaceutical-machinery", {
    fallbackTitle: "Pharmaceutical Machinery",
    fallbackDescription:
      "Browse pharmaceutical machinery for tablet, capsule, filling, processing, and packaging operations.",
    fallbackKeywords: [
      "pharmaceutical machinery",
      "used pharma machines",
      "pharma equipment",
    ],
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
