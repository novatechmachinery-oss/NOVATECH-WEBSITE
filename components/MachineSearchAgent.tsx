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

const agentUiCopy: Record<
  AgentLanguage,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    question: string;
    description: string;
    placeholder: string;
    searching: string;
    viewMachine: string;
  }
> = {
  english: {
    eyebrow: "AI Machine Search",
    title: "Machine Search Assistant",
    subtitle: "Find the right machine from our inventory",
    question: "What machine are you looking for?",
    description: "Enter what you are looking for, and we will check the available machines for you.",
    placeholder: "Write your machine requirements...",
    searching: "AI is searching...",
    viewMachine: "View Machine",
  },
  hindi: {
    eyebrow: "एआई मशीन सर्च",
    title: "मशीन सर्च असिस्टेंट",
    subtitle: "हमारी इन्वेंटरी से सही मशीन खोजें",
    question: "आप किस मशीन की तलाश कर रहे हैं?",
    description: "मशीन का प्रकार, ब्रांड, मॉडल या स्पेसिफिकेशन लिखें। हम उपलब्ध इन्वेंटरी जांचेंगे।",
    placeholder: "अपनी मशीन की आवश्यकता लिखें...",
    searching: "एआई खोज रहा है...",
    viewMachine: "मशीन देखें",
  },
  punjabi: {
    eyebrow: "ਏਆਈ ਮਸ਼ੀਨ ਸਰਚ",
    title: "ਮਸ਼ੀਨ ਸਰਚ ਅਸਿਸਟੈਂਟ",
    subtitle: "ਸਾਡੀ ਇਨਵੈਂਟਰੀ ਵਿੱਚੋਂ ਸਹੀ ਮਸ਼ੀਨ ਲੱਭੋ",
    question: "ਤੁਸੀਂ ਕਿਹੜੀ ਮਸ਼ੀਨ ਲੱਭ ਰਹੇ ਹੋ?",
    description: "ਮਸ਼ੀਨ ਦਾ ਟਾਈਪ, ਬ੍ਰਾਂਡ, ਮਾਡਲ ਜਾਂ ਸਪੈਸੀਫਿਕੇਸ਼ਨ ਲਿਖੋ। ਅਸੀਂ ਉਪਲਬਧ ਇਨਵੈਂਟਰੀ ਚੈੱਕ ਕਰਾਂਗੇ।",
    placeholder: "ਆਪਣੀ ਮਸ਼ੀਨ ਦੀ ਲੋੜ ਲਿਖੋ...",
    searching: "ਏਆਈ ਖੋਜ ਰਿਹਾ ਹੈ...",
    viewMachine: "ਮਸ਼ੀਨ ਵੇਖੋ",
  },
  tamil: {
    eyebrow: "ஏஐ மெஷின் தேடல்",
    title: "மெஷின் தேடல் உதவியாளர்",
    subtitle: "எங்கள் இருப்பிலிருந்து சரியான மெஷினை கண்டறியுங்கள்",
    question: "நீங்கள் எந்த மெஷினை தேடுகிறீர்கள்?",
    description: "மெஷின் வகை, பிராண்ட், மாடல் அல்லது விவரக்குறிப்புகளை எழுதுங்கள். இருப்பை நாங்கள் சரிபார்ப்போம்.",
    placeholder: "உங்கள் மெஷின் தேவையை எழுதுங்கள்...",
    searching: "ஏஐ தேடுகிறது...",
    viewMachine: "மெஷினை பார்க்கவும்",
  },
  marathi: {
    eyebrow: "एआय मशीन शोध",
    title: "मशीन शोध सहाय्यक",
    subtitle: "आमच्या इन्व्हेंटरीमधून योग्य मशीन शोधा",
    question: "तुम्ही कोणती मशीन शोधत आहात?",
    description: "मशीनचा प्रकार, ब्रँड, मॉडेल किंवा तपशील लिहा. आम्ही उपलब्ध इन्व्हेंटरी तपासू.",
    placeholder: "तुमची मशीनची गरज लिहा...",
    searching: "एआय शोधत आहे...",
    viewMachine: "मशीन पहा",
  },
  bengali: {
    eyebrow: "এআই মেশিন সার্চ",
    title: "মেশিন সার্চ সহায়ক",
    subtitle: "আমাদের ইনভেন্টরি থেকে সঠিক মেশিন খুঁজুন",
    question: "আপনি কোন মেশিন খুঁজছেন?",
    description: "মেশিনের ধরন, ব্র্যান্ড, মডেল বা স্পেসিফিকেশন লিখুন। আমরা উপলব্ধ ইনভেন্টরি পরীক্ষা করব।",
    placeholder: "আপনার মেশিনের প্রয়োজন লিখুন...",
    searching: "এআই খুঁজছে...",
    viewMachine: "মেশিন দেখুন",
  },
};

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

function AgentResultCard({
  result,
  viewMachine,
  onViewMachine,
}: {
  result: AgentMachineResult;
  viewMachine: string;
  onViewMachine: () => void;
}) {
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
        onClick={onViewMachine}
        className="mt-3 inline-flex min-h-10 items-center justify-center border border-[#145b93] bg-[#145b93] px-4 text-[0.74rem] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#0f4c7c] focus:outline-none focus:ring-2 focus:ring-[#145b93]/35"
      >
        {viewMachine} -&gt;
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
  const [mobileWidgetDismissed, setMobileWidgetDismissed] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
    setLanguage(nextLanguage);
    setMessages([{ id: createId(), role: "agent", text: welcomeText(nextLanguage) }]);
  }

  function openAgent() {
    if (language && messages.length > 0) {
      setOpen(true);
      return;
    }

    setLanguage(null);
    setMessages([]);
    setQuery("");
    setContext({});
    setOpen(true);
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

  const isInitialSearch = Boolean(
    language && messages.length === 1 && messages[0]?.role === "agent" && !loading,
  );
  const ui = agentUiCopy[language ?? "english"];

  const searchComposer = (
    <form
      onSubmit={submitSearch}
      className={
        isInitialSearch
          ? "mt-5 w-full max-w-xl"
          : "sticky bottom-0 border-t border-slate-200 bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]"
      }
    >
      <div className={isInitialSearch ? "machine-agent-gradient-border rounded-2xl" : ""}>
        <div className={`flex items-center gap-2 ${isInitialSearch ? "rounded-[15px] bg-white p-1.5" : ""}`}>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={loading}
          placeholder={ui.placeholder}
          aria-label="Machine search query"
          className={`min-h-13 min-w-0 flex-1 px-4 text-[0.92rem] font-semibold text-slate-900 outline-none placeholder:text-slate-400 disabled:bg-slate-100 ${
            isInitialSearch
              ? "rounded-xl border-0 bg-[#f8fbff] focus:ring-0"
              : "rounded-xl border border-slate-200 bg-[#f8fbff] focus:border-[#0878e8] focus:ring-2 focus:ring-[#0878e8]/20"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className="machine-agent-send-button inline-flex h-13 w-13 shrink-0 items-center justify-center border border-[#e32636] bg-[#e32636] text-white transition hover:bg-[#c91f30] focus:outline-none focus:ring-2 focus:ring-[#e32636]/30 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send machine search"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
        </div>
      </div>
    </form>
  );

  return (
    <>
      <div className="fixed bottom-6 right-5 z-40 flex flex-col items-center">
      <button
        type="button"
        onClick={openAgent}
        className={`premium-widget-animate machine-search-widget-card machine-search-mobile-card flex items-center justify-center border border-[#145b93]/25 bg-white text-[#145b93] shadow-[0_16px_36px_rgba(15,23,42,0.16)] transition duration-300 focus:outline-none focus:ring-2 focus:ring-[#145b93]/30 p-1.5 md:h-[220px] md:w-[220px] md:rounded-2xl md:p-4 md:bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_58%,#e9f6ff_100%)] md:text-[#0878e8] md:border-[#00a8ff]/70 md:shadow-[0_16px_36px_rgba(8,120,232,0.18)] ${
          mobileWidgetDismissed ? "h-14 w-14" : "h-[108px] w-[108px] p-2"
        }`}
        aria-label="Open machine search assistant"
      >
        {/* Mobile Layout */}
        {mobileWidgetDismissed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 md:hidden">
            <Search className="h-5 w-5 text-[#0878e8]" />
            <span className="text-[0.58rem] font-black uppercase tracking-[0.08em] text-[#07549c]">Search</span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 md:hidden">
            <span className="text-[0.62rem] font-black uppercase tracking-[0.07em] text-[#07549c]">AI Search</span>
            <span className="text-[0.46rem] font-bold uppercase tracking-[0.04em] text-[#0878e8]">Enter requirements</span>
            <div className="mt-1 flex h-7 w-full items-center gap-1.5 rounded-md border border-[#00a8ff]/45 bg-[#f8fbff] px-2 text-[#07549c] shadow-[0_2px_7px_rgba(8,120,232,0.1)]">
              <Search className="h-3 w-3 shrink-0" />
              <span className="truncate text-[0.47rem] font-bold">Search machines</span>
            </div>
          </div>
        )}

        {/* Desktop Square Card Layout (md+) */}
        <div className="hidden md:flex flex-col flex-1 justify-between h-full text-left">
          <div className="machine-search-icon-mark mt-1 flex h-[52px] shrink-0 items-center justify-center">
            <Search className="h-11 w-11 stroke-[2.25] text-[#4e82f4]" />
            <Sparkles className="machine-search-spark machine-search-spark--blue h-4 w-4" />
            <Sparkles className="machine-search-spark machine-search-spark--yellow h-3 w-3" />
            <Sparkles className="machine-search-spark machine-search-spark--pink h-3.5 w-3.5" />
          </div>

          <div className="mt-1 mb-2">
            <h4 className="text-[0.74rem] font-black uppercase tracking-[0.12em] text-[#0878e8]">Fastest AI Search</h4>
            <h3 className="mt-1.5 text-[1.04rem] font-extrabold uppercase leading-snug text-[#07549c]">
              Machine Search Assistant
            </h3>
          </div>

          <div className="w-full">
            <div className="machine-agent-gradient-border rounded-xl">
              <div className="flex items-center gap-2 rounded-[11px] bg-white px-3 py-2 text-white/50 transition duration-150">
                <Search className="h-4 w-4 shrink-0 text-[#145b93]/70" />
                <span className="text-[0.67rem] font-semibold truncate text-slate-500">Write your requirements...</span>
              </div>
            </div>
          </div>
        </div>
      </button>
      {!mobileWidgetDismissed ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMobileWidgetDismissed(true);
          }}
          className="machine-search-mobile-close absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center border border-white bg-[#07549c] text-white shadow-sm md:hidden"
          aria-label="Minimize search assistant"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
      </div>

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
          <header className="flex min-h-[96px] items-center justify-between border-b border-sky-100 bg-white px-6">
            <div className="min-w-0">
              <div className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#0878e8]">{ui.eyebrow}</div>
              <h2 className="mt-1 truncate text-xl font-black text-[#07549c]">{ui.title}</h2>
              <p className="mt-1 truncate text-[0.78rem] font-semibold text-slate-500">{ui.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="machine-agent-close-button inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[#e32636] bg-[#e32636] text-white transition hover:bg-[#c91f30] focus:outline-none focus:ring-2 focus:ring-[#e32636]/30"
              aria-label="Close machine search assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {!language ? (
            <div className="flex flex-1 items-center justify-center bg-[#f4f7fa] px-5 py-8">
              <div className="w-full max-w-md rounded-3xl border border-sky-100 bg-white p-7 text-center shadow-[0_18px_42px_rgba(8,120,232,0.13)]">
                <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#eaf6ff] text-[#0878e8]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="mt-5 text-[0.72rem] font-black uppercase tracking-[0.15em] text-[#0878e8]">AI Machine Search</p>
                <h3 className="mt-2 text-xl font-black text-[#07549c]">Choose your language</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Your search assistant will reply in the language you select.</p>
                <div className="mt-6 grid grid-cols-3 gap-2.5">
                {languageOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => chooseLanguage(option.id)}
                    className="machine-agent-language-button min-h-11 border border-sky-100 bg-[#f8fbff] px-2 text-sm font-black text-[#07549c] shadow-sm transition hover:border-[#0878e8] hover:bg-[#eaf6ff] focus:outline-none focus:ring-2 focus:ring-[#0878e8]/25"
                  >
                    {option.label}
                  </button>
                ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className={`flex-1 bg-[#f4f7fa] ${
                  isInitialSearch
                    ? "flex flex-col items-center justify-center px-6 py-8"
                    : "space-y-4 overflow-y-auto px-5 py-5"
                }`}
              >
                {isInitialSearch ? (
                  <div className="flex w-full max-w-xl flex-col items-center text-center">
                    <div className="machine-search-icon-mark flex h-[74px] items-center justify-center">
                      <Search className="h-14 w-14 stroke-[2.2] text-[#4e82f4]" />
                      <Sparkles className="machine-search-spark machine-search-spark--blue h-4 w-4" />
                      <Sparkles className="machine-search-spark machine-search-spark--yellow h-3 w-3" />
                      <Sparkles className="machine-search-spark machine-search-spark--pink h-3.5 w-3.5" />
                    </div>
                    <h3 className="mt-4 text-xl font-black text-[#07549c]">{ui.question}</h3>
                    <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                      {ui.description}
                    </p>
                  </div>
                ) : messages.map((message) => {
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
                              <AgentResultCard
                                key={result.id}
                                result={result}
                                viewMachine={ui.viewMachine}
                                onViewMachine={() => setOpen(false)}
                              />
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
                      <span className="text-xs font-bold uppercase tracking-wider">{ui.searching}</span>
                    </div>
                  </div>
                ) : null}
                {isInitialSearch ? searchComposer : null}
              </div>

              {!isInitialSearch ? searchComposer : null}
            </>
          )}
        </aside>
      </div>
    </>
  );
}
