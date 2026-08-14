"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isReactCompilerRequired } from "next/dist/build/swc";
import { contactDetails } from "@/lib/contact-details";
import { getDefaultAutoSelectFamily } from "net";

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
