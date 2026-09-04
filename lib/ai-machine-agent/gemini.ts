import type {
  AgentConversationIntent,
  AgentLanguage,
  AgentMachineResult,
  MachineSearchIntent,
} from "@/lib/ai-machine-agent/types";

const modelName = "gemini-1.5-flash";
const timeoutMs = 3500;

function languageName(language: AgentLanguage) {
  return {
    english: "English",
    hindi: "Hindi/Hinglish",
    chinese: "Simplified Chinese",
    punjabi: "Punjabi",
    tamil: "Tamil",
    marathi: "Marathi",
    bengali: "Bengali",
  }[language];
}

function fallbackConversationReply(query: string) {
  const normalized = query.toLowerCase().trim();

  if (/^(hello|hi|hey|good morning|good evening)\b/.test(normalized)) {
    return "Hello! How can I help you find the right machine?";
  }

  if (/how are you/.test(normalized)) {
    return "I'm doing well, thank you. What kind of machine are you looking for?";
  }

  if (/\b(thanks|thank you)\b/.test(normalized)) {
    return "You're welcome. Let me know if you need help finding a machine.";
  }

  if (/what can you do|help/.test(normalized)) {
    return "I can help you find machines by model, brand, type, or specifications.";
  }

  if (/\b(bye|goodbye)\b/.test(normalized)) {
    return "Thank you. I'm here whenever you need help with a machine search.";
  }

  return "I'm here to help you find the right machine. Tell me the model, brand, or specification you need.";
}

function shouldTreatAsConversation(query: string) {
  const normalized = query.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  if (/\d/.test(normalized)) return false;

  return /^(hello|hi|hey|good morning|good evening|good night|how are you|thanks|thank you|okay|ok|bye|goodbye|what can you do|i need some help|help)\b/.test(
    normalized,
  );
}

async function generateGeminiText(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 180,
          },
        }),
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function detectConversationIntent(input: {
  language: AgentLanguage;
  query: string;
}): Promise<AgentConversationIntent> {
  const fallback = shouldTreatAsConversation(input.query)
    ? {
        kind: "conversation" as const,
        reply: fallbackConversationReply(input.query),
      }
    : { kind: "search" as const };

  const response = await generateGeminiText(
    [
      "Classify the user's message for a machine-inventory assistant.",
      `Language: ${languageName(input.language)}.`,
      `User message: ${input.query}`,
      'Reply with strict JSON only: {"kind":"conversation","reply":"..."} or {"kind":"search"}.',
      "Use conversation only for greetings, thanks, small talk, general help, or simple assistant questions.",
      "Use search when the user is asking for a machine, model, brand, machine type, availability, or specifications.",
      "If kind is conversation, keep the reply short, natural, and professional in the selected language.",
      "Do not invent machines or mention inventory in conversation replies unless the user asks for it.",
    ].join("\n"),
  );

  if (!response) return fallback;

  try {
    const parsed = JSON.parse(response) as Partial<AgentConversationIntent>;
    if (parsed.kind === "search") return { kind: "search" };
    if (parsed.kind === "conversation" && typeof parsed.reply === "string" && parsed.reply.trim()) {
      return { kind: "conversation", reply: parsed.reply.trim().slice(0, 220) };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export async function createGeminiSummary(input: {
  language: AgentLanguage;
  intent: MachineSearchIntent;
  results: AgentMachineResult[];
  fallback: string;
  exactCount: number;
  closeCount: number;
}) {
  const machines = input.results.slice(0, 16).map((result) => ({
    title: result.title,
    model: result.model,
    specs: result.relevantSpecs.slice(0, 3),
    exact: result.exact,
  }));

  const response = await generateGeminiText(
    [
      "You are a helpful, professional machine inventory assistant.",
      `Language: ${languageName(input.language)}.`,
      `User query: ${input.intent.query}`,
      `Search focus: ${input.intent.identityQuery || input.intent.normalizedQuery}`,
      `Exact/relevant inventory matches: ${input.exactCount}.`,
      `Close alternatives: ${input.closeCount}.`,
      `Results JSON: ${JSON.stringify(machines)}`,
      `Safe fallback response: ${input.fallback}`,
      "Reply in the selected language only.",
      "If Results JSON is empty, explain politely that no matching machine is currently in inventory and ask for a machine type, brand, model, or key specification.",
      "If exact matches exist, say that an exact match was found and mention similar machines only if they are present below.",
      "If only close matches exist, say that the exact machine was not found and that the closest relevant machines are listed.",
      "Keep it short and professional. Use no more than two concise sentences.",
      "Do not invent specifications, availability, or machine names.",
    ].join("\n"),
  );

  return response && response.length <= 360 ? response : input.fallback;
}
