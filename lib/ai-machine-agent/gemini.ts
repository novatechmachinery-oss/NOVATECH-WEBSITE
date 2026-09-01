import type { AgentLanguage, AgentMachineResult, MachineSearchIntent } from "@/lib/ai-machine-agent/types";

const modelName = "gemini-1.5-flash";
const timeoutMs = 3500;

function languageName(language: AgentLanguage) {
  return {
    english: "English",
    hindi: "Hindi/Hinglish",
    punjabi: "Punjabi",
    tamil: "Tamil",
    marathi: "Marathi",
    bengali: "Bengali",
  }[language];
}

export async function createGeminiSummary(input: {
  language: AgentLanguage;
  intent: MachineSearchIntent;
  results: AgentMachineResult[];
  fallback: string;
  exactCount: number;
  closeCount: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return input.fallback;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const machines = input.results.slice(0, 16).map((result) => ({
      title: result.title,
      model: result.model,
      specs: result.relevantSpecs.slice(0, 3),
      exact: result.exact,
    }));

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
              parts: [
                {
                  text: [
                    "You are a helpful, professional machine inventory assistant.",
                    `Language: ${languageName(input.language)}.`,
                    `User query: ${input.intent.query}`,
                    `Exact/relevant inventory matches: ${input.exactCount}.`,
                    `Close alternatives: ${input.closeCount}.`,
                    `Results JSON: ${JSON.stringify(machines)}`,
                    `Safe fallback response: ${input.fallback}`,
                    "Reply in the selected language only.",
                    "If Results JSON is empty, explain politely that no matching machine is currently in inventory and ask for a machine type, brand, model, or key specification. Do not invent inventory.",
                    "If results exist, say clearly whether matching machines are available, mention exact/relevant matches first, and then close alternatives only if present. Do not invent specifications or availability.",
                    "Use no more than two concise sentences.",
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 120,
          },
        }),
      },
    );

    if (!response.ok) return input.fallback;

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text && text.length <= 360 ? text : input.fallback;
  } catch {
    return input.fallback;
  } finally {
    clearTimeout(timeout);
  }
}
