import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/textile-machinery", {
    title: "Textile Machinery",
    description:
      "Discover textile machinery for weaving, knitting, dyeing, finishing, and textile production applications.",
    keywords: ["textile machinery", "used textile machines", "textile production machinery"],
  });
}

export default function TextileMachineryPage() {
  return (
    <ComingSoonPage
      title="Textile Machinery"
      tag="Textile"
      description="This section is being prepared for weaving, knitting, dyeing, finishing, and textile production machinery."
    />
  );
}
