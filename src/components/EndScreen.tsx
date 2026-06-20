import type { GameMode, Player } from "@/lib/game-types";

type Props = {
  mode: GameMode;
  players: Player[];
  classScore: number;
  totalRounds: number;
  onPlayAgain: () => void;
};

export function EndScreen({
  mode,
  players,
  classScore,
  totalRounds,
  onPlayAgain,
}: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm animate-reveal">
      <div className="w-full max-w-lg rounded-[2rem] bg-gradient-to-br from-indigo-900 to-slate-900 p-8 text-white shadow-2xl ring-4 ring-sand/30">
        {mode === "class" ? (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-extrabold mb-2">
              Great Job, Cyber Defenders!
            </h2>
            <p className="text-white/70 mb-6">Final class score</p>
            <div className="rounded-3xl bg-sand text-slate-900 py-6 mb-6">
              <div className="text-6xl font-black">
                {classScore}
                <span className="text-2xl font-bold text-slate-700">
                  {" "}
                  / {totalRounds}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-sand">
                {winner ? `${winner.name} Wins!` : "Game Over!"}
              </h2>
            </div>
            <div className="space-y-2">
              {sorted.map((p, i) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-2xl px-5 py-3 ${
                    i === 0
                      ? "bg-sand text-slate-900"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8">
                      {medals[i] ?? `${i + 1}.`}
                    </span>
                    <span className="font-extrabold text-lg">{p.name}</span>
                  </div>
                  <span className="font-extrabold text-lg">
                    {p.score}
                    <span className="text-sm opacity-60"> / {totalRounds}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={onPlayAgain}
            className="rounded-full bg-seafoam px-8 py-4 text-lg font-extrabold text-slate-900 shadow-xl transition-transform hover:scale-105"
          >
            Play Again 🔄
          </button>
        </div>
      </div>
    </div>
  );
}
