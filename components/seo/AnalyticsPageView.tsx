"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function AnalyticsPageView({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    window.gtag?.("config", measurementId, {
      page_path: query ? `${pathname}?${query}` : pathname,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}
