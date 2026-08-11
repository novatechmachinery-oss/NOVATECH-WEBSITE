import "server-only";

import { getSeoConfig } from "@/lib/seo/seo-config";
import { getNextConfigRuntime } from "next/dist/server/config-shared";

function toTitleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateBreadcrumbs(pathnameWithQuery: string) {
  const { baseUrl } = await getSeoConfig();
  const [pathname, queryString] = pathnameWithQuery.split("?");
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [{ name: "Home", url: `${baseUrl}/` }];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const url = isLast && queryString ? `${baseUrl}${currentPath}?${queryString}` : `${baseUrl}${currentPath}`;
    crumbs.push({
      name: toTitleCase(decodeURIComponent(segment)),
      url,
    });
  });

  return crumbs;
}

 