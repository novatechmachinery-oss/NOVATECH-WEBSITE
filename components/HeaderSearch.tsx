"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MachineItem } from "@/lib/machines";

type HeaderSearchProps = {
  machines: MachineItem[];
};

function buildMachineHref(machine: MachineItem) {
  const params = new URLSearchParams();

  if (machine.categorySlug ?? machine.category) {
    params.set("category", machine.categorySlug ?? machine.category);
  }

  if (machine.subcategorySlug ?? machine.subcategory) {
    params.set("subcategory", machine.subcategorySlug ?? machine.subcategory ?? "");
  }

  params.set("machine", machine.id);

  return `/used-machinery?${params.toString()}`;
}

export default function HeaderSearch({ machines }: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return machines
      .filter((machine) => {
        const haystack = [
          machine.title,
          machine.category,
          machine.subcategory,
          machine.manufacturer,
          machine.model,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [machines, query]);

  function openMachineSuggestion(machine: MachineItem) {
    router.push(buildMachineHref(machine));
    setQuery("");
    setIsOpen(false);
  }

  function submitSearch() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      router.push("/used-machinery");
      setIsOpen(false);
      return;
    }

    router.push(`/used-machinery?q=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
  }

  return (
    <div className="relative hidden xl:block xl:w-[430px]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
        suppressHydrationWarning
        className="flex h-[34px] overflow-hidden rounded-[4px] border border-[#1a4a7a] bg-white shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)]"
      >
        <input
          suppressHydrationWarning
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          placeholder="Search Machinery..."
          className="h-full flex-1 border-0 px-12 text-[0.88rem] font-semibold text-slate-700 outline-none placeholder:text-slate-400"
        />
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <button
          type="submit"
          suppressHydrationWarning
          className="inline-flex w-[42px] items-center justify-center bg-[#0f4f89] text-white transition hover:bg-[#0c4475]"
          aria-label="Search machinery"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {isOpen && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[6px] border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
          {suggestions.map((machine) => (
            <Link
              key={machine.id}
              href={buildMachineHref(machine)}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                event.preventDefault();
                openMachineSuggestion(machine);
              }}
              className="flex w-full flex-col items-start gap-1 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
            >
              <span className="text-[0.9rem] font-black uppercase leading-tight text-slate-900">
                {machine.title}
              </span>
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-slate-500">
                {[machine.category, machine.subcategory].filter(Boolean).join(" | ")}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
