import { getMachineSearchIndex } from "@/lib/machines";
import { getSiteSettings } from "@/lib/site-settings.service";
import HeaderVisibility from "./HeaderVisibility";
import HomeCategoryNav from "./HomeCategoryNav";
import Navbar from "./Navbar";
import TopHeader from "./TopHeader";

export default async function SiteHeader() {
  const [settings, machineSearchIndex] = await Promise.all([getSiteSettings(), getMachineSearchIndex()]);

  return (
    <HeaderVisibility>
      <TopHeader
        phonePrimary={settings.contact.phonePrimary}
        phoneSecondary={settings.contact.phoneSecondary}
        logoSrc={settings.branding.logoSrc}
        logoAlt={settings.branding.logoAlt}
        machines={machineSearchIndex}
        categoryLinks={settings.navigation.categoryLinks}
      />
      <Navbar machines={machineSearchIndex} />
      <HomeCategoryNav types={settings.navigation.categoryLinks} />
    </HeaderVisibility>
  );
}

