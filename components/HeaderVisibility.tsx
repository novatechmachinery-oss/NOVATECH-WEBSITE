"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type HeaderVisibilityProps = {
  children: ReactNode;
};

export default function HeaderVisibility({ children }: HeaderVisibilityProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const toggleAnchorYRef = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 40) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        toggleAnchorYRef.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollYRef.current;

      if (delta < 0) {
        if (!isVisible && toggleAnchorYRef.current - currentScrollY >= 18) {
          setIsVisible(true);
          toggleAnchorYRef.current = currentScrollY;
        }
      } else if (delta > 0) {
        if (isVisible && currentScrollY - toggleAnchorYRef.current >= 32) {
          setIsVisible(false);
          toggleAnchorYRef.current = currentScrollY;
        }
      }

      if ((isVisible && delta < 0) || (!isVisible && delta > 0)) {
        toggleAnchorYRef.current = currentScrollY;
      }

      if (!isVisible && delta < 0 && currentScrollY <= 120) {
        setIsVisible(true);
        toggleAnchorYRef.current = currentScrollY;
      }

      lastScrollYRef.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVisible]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white shadow-sm shadow-slate-950/5 transition-transform duration-500 ease-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      {children}
    </header>
  );
}
