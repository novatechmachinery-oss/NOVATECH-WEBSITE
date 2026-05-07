import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/plastic-machinery", {
    title: "Plastic Machinery",
    description:
      "Explore plastic machinery opportunities including injection moulding, extrusion, recycling, and processing equipment.",
    keywords: ["plastic machinery", "used plastic machinery", "plastic processing machines"],
  });
}

export default function PlasticMachineryPage() {
  return (
    <ComingSoonPage
      title="Plastic Machinery"
      tag="Plastic"
      description="This section is being prepared for injection moulding, extrusion, recycling, and plastic processing machinery."
    />
  );
}
