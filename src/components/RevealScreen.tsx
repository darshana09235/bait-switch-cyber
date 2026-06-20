import type { GameMode, Player } from "@/lib/game-types";
import type { Scenario } from "@/data/scenarios";

type Props = {
  mode: GameMode;
  players: Player[];
  scenario: Scenario;
  isLastRound: boolean;
  classGotIt: boolean;
  awardedIds: Set<string>;
  onToggleClass: () => void;
  onTogglePlayer: (id: string) => void;
  onNext: () => void;
};

export function RevealScreen({
  mode,
  players,
  scenario,
  isLastRound,
  classGotIt,
  awardedIds,
  onToggleClass,
  onTogglePlayer,
  onNext,
}: Props) {
  const isFake = scenario.verdict === "fake";

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto animate-reveal ${
        isFake
          ? "bg-gradient-to-br from-rose-600 via-coral to-red-800"
          : "bg-gradient-to-br from-emerald-500 via-seafoam to-teal-700"
      }`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center gap-6 px-4 py-10 text-white">
        {scenario.tricky && (
          <div className="rounded-full bg-white/25 px-5 py-2 text-sm font-extrabold tracking-wide uppercase backdrop-blur">
            🤔 Tricky one!
          </div>
        )}

        <h1
          className="text-center font-black tracking-tight drop-shadow-lg"
          style={{ fontSize: "clamp(3.5rem, 11vw, 8rem)", lineHeight: 1 }}
        >
          {isFake ? "🚩 RED CARD!" : "🟢 GREEN CARD!"}
        </h1>

        <div className="w-full rounded-3xl bg-white/15 p-5 backdrop-blur ring-1 ring-white/30">
          <div className="text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
            {scenario.sender}
          </div>
          <p className="italic text-lg sm:text-xl font-medium">
            "{scenario.message}"
          </p>
        </div>

        <div className="w-full rounded-3xl bg-white/95 p-6 text-slate-900 shadow-2xl">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Why?
          </div>
          <p className="text-lg font-semibold leading-snug">{scenario.why}</p>
        </div>

        {/* Scoring */}
        <div className="w-full rounded-3xl bg-white/15 p-5 backdrop-blur">
          <div className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-white/80">
            Who got it right?
          </div>
          {mode === "class" ? (
            <button
              onClick={onToggleClass}
              className={`w-full rounded-2xl px-6 py-4 text-lg font-extrabold transition-all ${
                classGotIt
                  ? "bg-sand text-slate-900 shadow-xl scale-[1.02]"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {classGotIt ? "✅ Class got it! (+1)" : "Class got it right? (+1)"}
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((p) => {
                const on = awardedIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => onTogglePlayer(p.id)}
                    className={`rounded-2xl px-5 py-3 text-base font-extrabold transition-all ${
                      on
                        ? "bg-sand text-slate-900 shadow-xl scale-105"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {on ? "✅" : "➕"} {p.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          className="mt-2 rounded-full bg-slate-900 px-10 py-5 text-xl font-extrabold text-white shadow-2xl transition-transform hover:scale-105"
        >
          {isLastRound ? "See Results 🏆" : "Next Round ➜"}
        </button>
      </div>
    </div>
  );
}
