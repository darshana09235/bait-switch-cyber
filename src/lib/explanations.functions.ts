import { createServerFn } from "@tanstack/react-start";

type Input = {
  sender: string;
  message: string;
  verdict: "fake" | "safe";
  tricky?: boolean;
  ageGroup: number;
};

function validate(input: unknown): Input {
  const o = input as Record<string, unknown>;
  if (!o || typeof o !== "object") throw new Error("Invalid input");
  const sender = String(o.sender ?? "").trim().slice(0, 120);
  const message = String(o.message ?? "").trim().slice(0, 600);
  const verdict = o.verdict === "safe" ? "safe" : "fake";
  const tricky = Boolean(o.tricky);
  const ageGroupNum = Math.round(Number(o.ageGroup));
  const ageGroup = Math.max(5, Math.min(14, isNaN(ageGroupNum) ? 9 : ageGroupNum));
  if (!message) throw new Error("Message is required");
  return { sender, message, verdict, tricky, ageGroup };
}

function ageTone(age: number): string {
  if (age <= 7)
    return "Use very simple words a 6-year-old understands. Short sentences. No jargon like 'phishing', '2FA', or 'credentials'. Use ideas like 'asking for secrets', 'pretending to be someone', 'something feels weird'.";
  if (age <= 10)
    return "Use everyday words a 9-year-old understands. You can say 'scam' and 'fake', but avoid jargon like '2FA' or 'phishing'. Keep it concrete and friendly.";
  return "Use clear words a 12-13 year old understands. You can say 'phishing', 'scam', 'two-factor', 'urgency tactic'. Keep it concrete and short.";
}

export const generateExplanation = createServerFn({ method: "POST" })
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const verdictLabel =
      data.verdict === "fake" ? "RED CARD (fake / scam / unsafe)" : "GREEN CARD (safe / legit)";

    const system = `You are a kind teacher explaining online safety to a child.
Write ONE or TWO short sentences (max 35 words total) explaining WHY a message is ${verdictLabel}.
${ageTone(data.ageGroup)}
Be warm and clear, not scary. No emojis. No quotes. No preamble like "This is".
Just the explanation sentence(s).`;

    const user = `Sender: ${data.sender || "Unknown"}
Message: "${data.message}"
Verdict: ${verdictLabel}${data.tricky ? "\nNote: This one is tricky — kids might guess wrong." : ""}

Write the "Why?" explanation for kids aged ${data.ageGroup}.`;

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
