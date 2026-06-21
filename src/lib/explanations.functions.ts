import { createServerFn } from "@tanstack/react-start";
import type { AgeBucket } from "@/data/scenarios";

type Input = {
  sender: string;
  message: string;
  verdict: "fake" | "safe";
  tricky?: boolean;
  ageGroups: AgeBucket[];
};

const VALID_BUCKETS: AgeBucket[] = ["5-7", "8-10", "11-14"];

function validate(input: unknown): Input {
  const o = input as Record<string, unknown>;
  if (!o || typeof o !== "object") throw new Error("Invalid input");
  const sender = String(o.sender ?? "").trim().slice(0, 120);
  const message = String(o.message ?? "").trim().slice(0, 600);
  const verdict = o.verdict === "safe" ? "safe" : "fake";
  const tricky = Boolean(o.tricky);
  const raw = Array.isArray(o.ageGroups) ? o.ageGroups : [];
  const ageGroups = raw.filter((b): b is AgeBucket =>
    VALID_BUCKETS.includes(b as AgeBucket)
  );
  if (!message) throw new Error("Message is required");
  if (ageGroups.length === 0) throw new Error("Pick at least one age group");
  return { sender, message, verdict, tricky, ageGroups };
}

function ageTone(buckets: AgeBucket[]): { label: string; guide: string } {
  // Aim explanation at the youngest selected bucket so it stays accessible.
  if (buckets.includes("5-7")) {
    return {
      label: "ages 5–7",
      guide:
        "Use very simple words a 6-year-old understands. Short sentences. No jargon like 'phishing', '2FA', or 'credentials'. Use ideas like 'asking for secrets', 'pretending to be someone', 'something feels weird'.",
    };
  }
  if (buckets.includes("8-10")) {
    return {
      label: "ages 8–10",
      guide:
        "Use everyday words a 9-year-old understands. You can say 'scam' and 'fake', but avoid jargon like '2FA' or 'phishing'. Keep it concrete and friendly.",
    };
  }
  return {
    label: "ages 11–14",
    guide:
      "Use clear words a 12-13 year old understands. You can say 'phishing', 'scam', 'OTP', 'urgency tactic'. Keep it concrete and short.",
  };
}

export const generateExplanation = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const verdictLabel =
      data.verdict === "fake" ? "RED CARD (fake / scam / unsafe)" : "GREEN CARD (safe / legit)";
    const tone = ageTone(data.ageGroups);

    const system = `You are a kind teacher explaining online safety to a child.
Write ONE or TWO short sentences (max 35 words total) explaining WHY a message is ${verdictLabel}.
${tone.guide}
Be warm and clear, not scary. No emojis. No quotes. No preamble like "This is".
Just the explanation sentence(s).`;

    const user = `Sender: ${data.sender || "Unknown"}
Message: "${data.message}"
Verdict: ${verdictLabel}${data.tricky ? "\nNote: This one is tricky — kids might guess wrong." : ""}

Write the "Why?" explanation for ${tone.label}.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (res.status === 429) throw new Error("Rate limit — please try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Add credits in workspace billing settings.");
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const why = (json.choices?.[0]?.message?.content ?? "").trim().replace(/^["']|["']$/g, "");
    if (!why) throw new Error("Empty response from AI");
    return { why };
  });
