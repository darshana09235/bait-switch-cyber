import { useState } from "react";
import type { AgeBucket, CustomScenario } from "@/lib/game-types";
import type { Scenario } from "@/data/scenarios";
import { scenarios as builtInScenarios } from "@/data/scenarios";

type Props = {
  ageGroups: AgeBucket[];
  customScenarios: CustomScenario[];
  deletedBuiltInIds: string[];
  onDeleteCustom: (id: string) => void;
  onEditCustom: (s: CustomScenario) => void;
  onHideBuiltIn: (id: string) => void;
  onRestoreAll: () => void;
};

type Row =
  | { kind: "custom"; s: CustomScenario }
  | { kind: "builtin"; s: Scenario };

export function QuestionLibrary({
  ageGroups,
  customScenarios,
  deletedBuiltInIds,
  onDeleteCustom,
  onEditCustom,
  onHideBuiltIn,
  onRestoreAll,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const matchesAge = (s: Scenario) =>
    ageGroups.length === 0 || s.ageGroups.some((b) => ageGroups.includes(b));

  const customRows: Row[] = customScenarios
    .filter(matchesAge)
    .map((s) => ({ kind: "custom" as const, s }));

  const activeBuiltIns = builtInScenarios.filter(
    (s) => matchesAge(s) && !deletedBuiltInIds.includes(s.id)
  );
  const builtInRows: Row[] = activeBuiltIns.map((s) => ({ kind: "builtin" as const, s }));

  const rows = [...customRows, ...builtInRows];

  const hiddenCount = builtInScenarios.filter(
    (s) => matchesAge(s) && deletedBuiltInIds.includes(s.id)
  ).length;

  return (
    <div className="rounded-3xl bg-white/10 p-6 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-bold text-white">Question library</div>
          <div className="text-xs text-white/60">
            {rows.length} active{hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ""} for the picked ages
          </div>
        </div>
        {hiddenCount > 0 && (
          <button
            onClick={onRestoreAll}
            className="rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25"
          >
            ♻️ Restore hidden
          </button>
        )}
      </div>

      {ageGroups.length === 0 && (
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
          Pick an age group to see the question list.
        </div>
      )}

      {ageGroups.length > 0 && rows.length === 0 && (
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80">
          No questions for these ages. Add your own or restore hidden ones.
        </div>
      )}

      {rows.length > 0 && (
        <ul className="divide-y divide-white/10 rounded-2xl bg-white/5 ring-1 ring-white/10">
          {rows.map((row) => {
            const s = row.s;
            const isCustom = row.kind === "custom";
            const confirming = confirmId === s.id;
            return (
              <li key={s.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 text-xl shrink-0" aria-hidden>
                  {s.verdict === "fake" ? "🚩" : "🟢"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                      {s.sender}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                        isCustom
                          ? "bg-sand text-slate-900"
                          : "bg-white/15 text-white/80"
                      }`}
                    >
                      {isCustom ? "Custom" : "Built-in"}
                    </span>
                    {s.tricky && (
                      <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-100">
                        🤔 tricky
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-white/90 line-clamp-2">{s.message}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {isCustom && (
                    <button
                      onClick={() => onEditCustom(row.s as CustomScenario)}
                      className="rounded-full bg-white/15 h-9 w-9 text-sm font-bold text-white hover:bg-white/25"
                      aria-label="Edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {confirming ? (
                    <>
                      <button
                        onClick={() => {
                          if (isCustom) onDeleteCustom(s.id);
                          else onHideBuiltIn(s.id);
                          setConfirmId(null);
                        }}
                        className="rounded-full bg-rose-500 px-3 h-9 text-xs font-extrabold text-white hover:bg-rose-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-full bg-white/15 px-3 h-9 text-xs font-bold text-white hover:bg-white/25"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(s.id)}
                      className="rounded-full bg-white/15 h-9 w-9 text-sm font-bold text-white hover:bg-rose-500"
                      aria-label="Delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-white/50 italic">
        Deletes are saved on this device only. Use "Restore hidden" to bring built-ins back.
      </p>
    </div>
  );
}
