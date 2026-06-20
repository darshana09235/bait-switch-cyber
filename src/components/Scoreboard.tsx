import type { GameMode, Player } from "@/lib/game-types";

type Props = {
  mode: GameMode;
  players: Player[];
  classScore: number;
  totalRounds: number;
};

export function Scoreboard({ mode, players, classScore, totalRounds }: Props) {
  if (mode === "class") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-white backdrop-blur">
        <span className="text-sand">⭐</span>
        <span className="font-bold">Class Score:</span>
        <span className="text-lg font-extrabold text-sand">
          {classScore}
          <span className="text-white/60 text-sm font-normal"> / {totalRounds}</span>
        </span>
      </div>
    );
  }

  const max = players.reduce((m, p) => Math.max(m, p.score), 0);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {players.map((p) => {
        const isLeader = p.score === max && max > 0;
        return (
          <div
            key={p.id}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold backdrop-blur ${
              isLeader
                ? "bg-sand text-slate-900 shadow-lg"
                : "bg-white/10 text-white"
            }`}
          >
            {isLeader && <span>👑</span>}
            <span>{p.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isLeader ? "bg-slate-900/20" : "bg-white/20"
              }`}
            >
              {p.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
