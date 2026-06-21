import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { CustomScenario } from "@/lib/game-types";
import { generateExplanation } from "@/lib/explanations.functions";

type Props = {
  ageGroup: number;
  customScenarios: CustomScenario[];
  onChange: (next: CustomScenario[]) => void;
};

export function CustomQuestionEditor({ ageGroup, customScenarios, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [verdict, setVerdict] = useState<"fake" | "safe" | null>(null);
  const [tricky, setTricky] = useState(false);
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useServerFn(generateExplanation);

  const reset = () => {
    setSender("");
    setMessage("");
    setVerdict(null);
    setTricky(false);
    setWhy("");
    setError(null);
    setOpen(false);
  };

  const canGenerate = message.trim().length > 0 && verdict !== null && !loading;
  const canSave = canGenerate && why.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate || !verdict) return;
    setLoading(true);
    setError(null);
    try {
      const { why: generated } = await generate({
        data: { sender, message, verdict, tricky, ageGroup },
      });
      setWhy(generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!canSave || !verdict) return;
    const next: CustomScenario = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      custom: true,
      sender: sender.trim() || "Unknown",
      message: message.trim(),
      verdict,
      why: why.trim(),
      tricky,
    };
    onChange([...customScenarios, next]);
    reset();
  };

  const handleDelete = (id: string) => {
    onChange(customScenarios.filter((c) => c.id !== id));
  };

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="font-bold text-white">Your own questions (optional)</div>
          <div className="text-xs text-white/60">
            AI writes the "Why?" for the age you picked above.
          </div>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-full bg-sand px-5 py-2 text-sm font-extrabold text-slate-900 shadow-lg hover:scale-105 transition-transform"
          >
            ➕ Add
          </button>
        )}
      </div>

      {customScenarios.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {customScenarios.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-sm"
            >
              <span>{c.verdict === "fake" ? "🚩" : "🟢"}</span>
              <span className="max-w-[200px] truncate font-semibold text-white">
                {c.message}
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="ml-1 rounded-full bg-white/20 h-6 w-6 text-xs font-bold text-white hover:bg-rose-500"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <input
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Sender (e.g. Unknown Number)"
            className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sand"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="The message kids will see…"
            className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-sand"
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setVerdict("fake")}
              className={`rounded-2xl px-4 py-3 font-extrabold transition-all ${
                verdict === "fake"
                  ? "bg-rose-500 text-white scale-[1.02] shadow-xl"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              🚩 Red Card (fake)
            </button>
            <button
              onClick={() => setVerdict("safe")}
              className={`rounded-2xl px-4 py-3 font-extrabold transition-all ${
                verdict === "safe"
                  ? "bg-emerald-500 text-white scale-[1.02] shadow-xl"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              🟢 Green Card (safe)
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={tricky}
              onChange={(e) => setTricky(e.target.checked)}
              className="h-4 w-4 accent-sand"
            />
            Mark as 🤔 tricky one
          </label>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full rounded-2xl bg-seafoam px-4 py-3 font-extrabold text-slate-900 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
          >
            {loading ? "✨ Generating…" : why ? "✨ Regenerate explanation" : "✨ Generate explanation"}
          </button>

          {error && (
            <div className="rounded-xl bg-rose-500/30 px-3 py-2 text-sm text-white">{error}</div>
          )}

          {why && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-white/70">
                Why? (you can edit)
              </label>
              <textarea
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border-0 bg-white/95 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-sand"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={reset}
              className="rounded-full bg-white/15 px-5 py-2 font-bold text-white hover:bg-white/25"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-full bg-sand px-6 py-2 font-extrabold text-slate-900 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              Save question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
