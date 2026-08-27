"use client";

import Link from "next/link";
import { Bot, Loader2, Search, Send, Sparkles, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

import type {
  AgentLanguage,
  AgentMachineResult,
  AgentSearchContext,
  AgentSearchResponse,
} from "@/lib/ai-machine-agent/types";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
  results?: AgentMachineResult[];
};

const languageOptions: Array<{ id: AgentLanguage; label: string }> = [
  { id: "english", label: "English" },
  { id: "hindi", label: "हिंदी" },
  { id: "punjabi", label: "ਪੰਜਾਬੀ" },
  { id: "tamil", label: "தமிழ்" },
  { id: "marathi", label: "मराठी" },
  { id: "bengali", label: "বাংলা" },
];

const sessionLanguageKey = "novatech-machine-agent-language";

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function welcomeText(language: AgentLanguage) {
  return {
    english: "Tell me the machine name, brand, model, or specs.",
    hindi: "Machine name, brand, model ya specs batayein.",
    punjabi: "Machine name, brand, model ya specs dasso.",
    tamil: "Machine name, brand, model அல்லது specs சொல்லுங்கள்.",
    marathi: "Machine name, brand, model kiwa specs sanga.",
    bengali: "Machine name, brand, model ba specs bolun.",
  }[language];
}

function emptyMessage(language: AgentLanguage) {
  return {
    english: "Please type a machine name or specification.",
    hindi: "Machine name ya specification type karein.",
    punjabi: "Machine name ya specification type karo.",
    tamil: "Machine name அல்லது specification type செய்யவும்.",
    marathi: "Machine name kiwa specification type kara.",
    bengali: "Machine name ba specification type korun.",
  }[language];
}

function AgentResultCard({ result }: { result: AgentMachineResult }) {
  const specs = result.relevantSpecs.slice(0, 4);

  return (
    <article className="border border-slate-200 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
      <h3 className="text-[0.94rem] font-black uppercase leading-snug text-slate-950">
        {result.title}
      </h3>
      <dl className="mt-3 space-y-1.5 text-[0.78rem] leading-5 text-slate-700">
        {result.model && !specs.some((spec) => spec.label.toLowerCase() === "model") ? (
          <div className="grid grid-cols-[6.8rem_minmax(0,1fr)] gap-2">
            <dt className="font-black text-slate-500">Model</dt>
            <dd className="break-words font-semibold text-slate-900">{result.model}</dd>
          </div>
        ) : null}
        {specs.map((spec) => (
          <div key={`${spec.label}-${spec.value}`} className="grid grid-cols-[6.8rem_minmax(0,1fr)] gap-2">
            <dt className="font-black text-slate-500">{spec.label}</dt>
            <dd className="break-words font-semibold text-slate-900">{spec.value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={result.url}
        className="mt-3 inline-flex min-h-10 items-center justify-center border border-[#145b93] bg-[#145b93] px-4 text-[0.74rem] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#0f4c7c] focus:outline-none focus:ring-2 focus:ring-[#145b93]/35"
      >
        View Machine -&gt;
      </Link>
    </article>
  );
}

export default function MachineSearchAgent() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<AgentLanguage | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [context, setContext] = useState<AgentSearchContext>({});
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(sessionLanguageKey) as AgentLanguage | null;
    if (saved && languageOptions.some((item) => item.id === saved)) {
      setLanguage(saved);
      setMessages([{ id: createId(), role: "agent", text: welcomeText(saved) }]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => {
      inputRef.current?.focus();
      panelRef.current?.focus();
    }, 120);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function chooseLanguage(nextLanguage: AgentLanguage) {
    window.sessionStorage.setItem(sessionLanguageKey, nextLanguage);
    setLanguage(nextLanguage);
    setMessages([{ id: createId(), role: "agent", text: welcomeText(nextLanguage) }]);
  }

  async function submitSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!language || loading) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setMessages((items) => [...items, { id: createId(), role: "agent", text: emptyMessage(language) }]);
      return;
    }

    setQuery("");
    setLoading(true);
    setMessages((items) => [...items, { id: createId(), role: "user", text: trimmed }]);

    try {
      const response = await fetch("/api/machine-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, language, context }),
      });
      const data = (await response.json()) as AgentSearchResponse;
      setContext(data.context ?? {});
      setMessages((items) => [
        ...items,
        {
          id: createId(),
          role: "agent",
          text: data.message,
          results: data.results,
        },
      ]);
    } catch {
      setMessages((items) => [...items, { id: createId(), role: "agent", text: emptyMessage(language) }]);
    } finally {
      setLoading(false);
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitSearch();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="premium-widget-animate fixed bottom-6 right-5 z-40 flex items-center justify-center border border-[#145b93]/25 bg-white text-[#145b93] shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#145b93]/30 h-[52px] w-[205px] rounded-full p-1.5 md:h-[220px] md:w-[220px] md:rounded-2xl md:p-3 md:bg-[linear-gradient(135deg,#0f3f70_0%,#145b93_54%,#1f7dbb_100%)] md:text-white md:border-[#145b93]"
        aria-label="Open machine search assistant"
      >
        {/* Mobile Layout */}
        <div className="flex items-center justify-center gap-2.5 w-full h-full md:hidden px-3">
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#145b93] border border-sky-100/70 shadow-inner">
            <Search className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[0.76rem] font-extrabold uppercase tracking-[0.03em] whitespace-nowrap text-[#145b93]">
            ⚡ Fastest AI Search
          </span>
        </div>

        {/* Desktop Square Card Layout (md+) */}
        <div className="hidden md:flex flex-col flex-1 justify-between h-full text-left">
          <div className="flex items-center justify-between w-full">
            <div className="relative inline-flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 rounded-lg">
              <Search className="h-5.5 w-5.5 text-sky-200" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded text-[0.64rem] font-bold tracking-wider uppercase text-sky-100">
              <Sparkles className="h-3 w-3 text-sky-300" /> Live AI
            </span>
          </div>

          <div className="my-2">
            <h4 className="text-[0.66rem] font-black uppercase tracking-widest text-sky-200">Fastest AI Search</h4>
            <h3 className="text-[0.98rem] font-extrabold uppercase leading-snug text-white mt-0.5">
              Machine Search Assistant
            </h3>
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/50 hover:bg-white/15 transition duration-150">
              <Search className="h-4 w-4 shrink-0 text-white/70" />
              <span className="text-xs font-semibold truncate text-white/70">Ask AI about machines...</span>
            </div>
          </div>
        </div>
      </button>

      <div
        className={`fixed inset-0 z-50 bg-slate-950/20 transition-opacity duration-300 lg:bg-transparent ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <aside
          ref={panelRef}
          tabIndex={-1}
          className={`ml-auto flex h-[100dvh] w-full flex-col border-l border-slate-200 bg-slate-50 shadow-[0_0_48px_rgba(15,23,42,0.2)] transition-transform duration-300 ease-out sm:w-[68vw] sm:min-w-[520px] lg:w-[38vw] lg:min-w-[520px] lg:max-w-[720px] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Machine Search Assistant"
        >
          <header className="flex min-h-[92px] items-center justify-between border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f3f8fc_100%)] px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-13 w-13 shrink-0 items-center justify-center border border-sky-200 bg-white text-[#145b93] shadow-[0_10px_22px_rgba(20,91,147,0.12)]">
                <Bot className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[0.74rem] font-black uppercase tracking-[0.14em] text-[#145b93]">
                  <Sparkles className="h-4 w-4" />
                  AI Agent
                </div>
                <h2 className="mt-1 truncate text-lg font-black text-slate-950">Machine Search Assistant</h2>
                <p className="mt-0.5 truncate text-[0.76rem] font-semibold text-slate-500">
                  Find the right machine for your requirements
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#145b93]/30"
              aria-label="Close machine search assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {!language ? (
            <div className="flex flex-1 flex-col justify-center px-5">
              <p className="text-center text-lg font-black leading-tight text-slate-950">
                Which language would you like to continue in?
              </p>
              <div className="mx-auto mt-5 grid w-full max-w-sm grid-cols-3 gap-2">
                {languageOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseLanguage(option.id)}
                    className="min-h-11 border border-slate-200 bg-white px-2 text-sm font-black text-slate-900 shadow-sm transition hover:border-[#145b93] hover:text-[#145b93] focus:outline-none focus:ring-2 focus:ring-[#145b93]/30"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 bg-[#f4f7fa]">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 items-end ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-[#145b93] shadow-sm mb-1">
                          <Bot className="h-4.5 w-4.5" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[85%]">
                        <div
                          className={`px-4 py-2.5 shadow-sm text-[0.88rem] leading-relaxed ${
                            isUser
                              ? "bg-[#145b93] text-white rounded-2xl rounded-br-none"
                              : "bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-bl-none"
                          }`}
                        >
                          <p className="font-semibold whitespace-pre-wrap">{message.text}</p>
                        </div>
                        {message.results?.length ? (
                          <div className="mt-3 space-y-3 w-full">
                            {message.results.map((result) => (
                              <AgentResultCard key={result.id} result={result} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {loading ? (
                  <div className="flex gap-3 items-end justify-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-white text-[#145b93] shadow-sm mb-1">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 shadow-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#145b93]" />
                      <span className="text-xs font-bold uppercase tracking-wider">AI is searching...</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <form onSubmit={submitSearch} className="sticky bottom-0 border-t border-slate-200 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    disabled={loading}
                    placeholder="lathe X 1000 dia 500"
                    aria-label="Machine search query"
                    className="min-h-13 min-w-0 flex-1 border border-slate-300 bg-white px-4 text-[0.92rem] font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#145b93] focus:ring-2 focus:ring-[#145b93]/20 disabled:bg-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-13 w-13 shrink-0 items-center justify-center border border-[#145b93] bg-[#145b93] text-white transition hover:bg-[#0f4c7c] focus:outline-none focus:ring-2 focus:ring-[#145b93]/30 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Send machine search"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </form>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
