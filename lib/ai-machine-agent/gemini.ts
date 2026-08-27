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
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || input.results.length === 0) return input.fallback;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const machines = input.results.map((result) => ({
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
                    "You are a machine sales search assistant.",
                    "Write only one short result heading. No explanations.",
                    `Language: ${languageName(input.language)}.`,
                    `User query: ${input.intent.query}`,
                    `Results JSON: ${JSON.stringify(machines)}`,
                    `Fallback heading: ${input.fallback}`,
                    "Return a concise heading only, under 14 words.",
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 50,
          },
        }),
      },
    );

    if (!response.ok) return input.fallback;

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text && text.length <= 140 ? text : input.fallback;
  } catch {
    return input.fallback;
  } finally {
    clearTimeout(timeout);
  }
}
