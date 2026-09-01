import { NextResponse } from "next/server";

import { createGeminiSummary } from "@/lib/ai-machine-agent/gemini";
import { buildSearchMessage, getAgentCopy } from "@/lib/ai-machine-agent/messages";
import { parseMachineSearchIntent, shouldAskForNumericClarification } from "@/lib/ai-machine-agent/parser";
import { searchMachines } from "@/lib/ai-machine-agent/search";
import type { AgentLanguage, AgentSearchContext, AgentSearchResponse } from "@/lib/ai-machine-agent/types";
import { getMachineInventory } from "@/lib/machines";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const languages = new Set<AgentLanguage>(["english", "hindi", "punjabi", "tamil", "marathi", "bengali"]);

function asLanguage(value: unknown): AgentLanguage {
  return typeof value === "string" && languages.has(value as AgentLanguage) ? (value as AgentLanguage) : "english";
}

function asContext(value: unknown): AgentSearchContext {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as AgentSearchContext;
}

function cleanQuery(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 500) : "";
}

export async function POST(request: Request) {
  let language: AgentLanguage = "english";

  try {
    const body = (await request.json()) as {
      query?: unknown;
      language?: unknown;
      context?: unknown;
    };

    language = asLanguage(body.language);
    const query = cleanQuery(body.query);
    const context = asContext(body.context);
    const labels = getAgentCopy(language);

    if (!query) {
      return NextResponse.json({
        message: labels.empty,
        results: [],
        context,
      } satisfies AgentSearchResponse);
    }

    const intent = parseMachineSearchIntent(query, context);

    if (shouldAskForNumericClarification(intent, context)) {
      return NextResponse.json({
        message: labels.clarification,
        results: [],
        context,
        needsClarification: true,
      } satisfies AgentSearchResponse);
    }

    const machines = await getMachineInventory();
    const { results, nextContext, hasExact, exactCount, closeCount } = searchMachines(machines, intent, context);
    const fallback = buildSearchMessage(language, results, hasExact, exactCount, closeCount);
    const message = await createGeminiSummary({
      language,
      intent,
      results,
      fallback,
      exactCount,
      closeCount,
    });

    return NextResponse.json({
      message,
      results,
      context: nextContext,
    } satisfies AgentSearchResponse);
  } catch (error) {
    console.error("Machine agent search failed.", error);
    return NextResponse.json(
      {
        message: getAgentCopy(language).error,
        results: [],
        context: {},
      } satisfies AgentSearchResponse,
      { status: 200 },
    );
  }
}
