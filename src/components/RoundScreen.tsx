import type { GameMode, Player } from "@/lib/game-types";
import type { Scenario } from "@/data/scenarios";
import { PhoneCard } from "./PhoneCard";
import { Scoreboard } from "./Scoreboard";

type Props = {
  mode: GameMode;
  players: Player[];
  classScore: number;
  roundIndex: number;
  totalRounds: number;
  scenario: Scenario;
  onReveal: () => void;
};

export function RoundScreen({
  mode,
  players,
  classScore,
  roundIndex,
  totalRounds,
  scenario,
  onReveal,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
          Round {roundIndex + 1} of {totalRounds}
        </div>
        <Scoreboard
          mode={mode}
          players={players}
          classScore={classScore}
          totalRounds={totalRounds}
        />
      </div>

      <div className="my-10">
        <PhoneCard sender={scenario.sender} message={scenario.message} />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onReveal}
          className="rounded-full bg-sand px-10 py-5 text-xl font-extrabold text-slate-900 shadow-2xl transition-transform hover:scale-105"
        >
          🔍 Reveal the Answer
        </button>
        <p className="text-sm text-white/60 italic">
          Wait for the kids' Red/Green cards first!
        </p>
      </div>
    </div>
  );
}
