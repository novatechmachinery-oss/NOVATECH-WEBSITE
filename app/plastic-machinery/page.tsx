import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/plastic-machinery", {
    fallbackTitle: "Plastic Machinery",
    fallbackDescription:
      "Explore plastic machinery opportunities including injection moulding, extrusion, recycling, and processing equipment.",
    fallbackKeywords: [
      "plastic machinery",
      "used plastic machinery",
      "plastic processing machines",
    ],
  });
}

export default function PlasticMachineryPage() {
  return (
    <ComingSoonPage
      title="Plastic Machinery"
      tag="UP"
      description="This section is being prepared for injection moulding, extrusion, recycling, and plastic processing machinery."
    />
  );
}
