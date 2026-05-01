"use client";

import { useEffect, useRef, useState } from "react";

import type { SiteSettings } from "@/lib/site-settings.types";
import HomeCategoryNav from "./HomeCategoryNav";
import Navbar from "./Navbar";
import TopHeader from "./TopHeader";

export default function SiteHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAwayFromTop, setIsAwayFromTop] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function handleScroll() {
      const shouldStick = window.scrollY > 40;

      if (!shouldStick) {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
        }
        setIsAwayFromTop(false);
        setIsVisible(true);
        return;
      }

      if (!isAwayFromTop) {
        setIsAwayFromTop(true);
        setIsVisible(false);

        timerRef.current = window.setTimeout(() => {
          setIsVisible(true);
        }, 1000);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isAwayFromTop]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as SiteSettings;
        if (!cancelled) {
          setSettings(data);
        }
      } catch {}
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white shadow-sm shadow-slate-950/5 transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <TopHeader
        emailAddress={settings?.contact.emailAddress}
        phonePrimary={settings?.contact.phonePrimary}
        phoneSecondary={settings?.contact.phoneSecondary}
      />
      <Navbar />
      <HomeCategoryNav types={settings?.navigation.categoryLinks} />
    </header>
  );
}
