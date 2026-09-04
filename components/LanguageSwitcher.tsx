"use client";

import { Languages } from "lucide-react";
import { useEffect, useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "zh-CN", label: "中文" },
  { code: "ta", label: "தமிழ்" },
];

declare global {
  interface Window {
    google?: { translate?: { TranslateElement?: new (options: object, element: string) => unknown } };
    googleTranslateElementInit?: () => void;
  }
}

function setTranslationCookie(language: string) {
  const value = `/en/${language}`;
  document.cookie = `googtrans=${value}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `googtrans=${value}; path=/; max-age=31536000; SameSite=Lax; domain=${window.location.hostname}`;
}

export default function LanguageSwitcher() {
  const [current] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("novatech-site-language");
    return saved && languages.some((language) => language.code === saved) ? saved : "en";
  });

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google-translate-root");
      }
    };

    if (!document.querySelector('script[data-google-translate="true"]')) {
      const script = document.createElement("script");
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.dataset.googleTranslate = "true";
      document.body.appendChild(script);
    }
  }, []);

  function changeLanguage(code: string) {
    window.localStorage.setItem("novatech-site-language", code);
    setTranslationCookie(code);
    window.location.reload();
  }

  return (
    <div className="site-language-switcher" aria-label="Change website language">
      <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
      <select value={current} onChange={(event) => changeLanguage(event.target.value)} aria-label="Change language">
        {languages.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
      </select>
      <div id="google-translate-root" className="sr-only" aria-hidden="true" />
    </div>
  );
}
