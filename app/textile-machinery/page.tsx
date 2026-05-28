import type { Metadata } from "next";
import ComingSoonPage from "../../components/ComingSoonPage";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("/textile-machinery", {
    fallbackTitle: "Textile Machinery",
    fallbackDescription:
      "Discover textile machinery for weaving, knitting, dyeing, finishing, and textile production applications.",
    fallbackKeywords: [
      "textile machinery",
      "used textile machines",
      "textile production machinery",
    ],
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
