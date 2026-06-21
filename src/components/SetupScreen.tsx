import { useState } from "react";
import type { GameMode, Player, CustomScenario, SetupPayload } from "@/lib/game-types";
import { DEFAULT_TEAM_NAMES } from "@/lib/game-types";
import { AgeGroupPicker } from "./AgeGroupPicker";
import { CustomQuestionEditor } from "./CustomQuestionEditor";

type Props = {
  onStart: (payload: SetupPayload) => void;
};

export function SetupScreen({ onStart }: Props) {
  const [mode, setMode] = useState<GameMode | null>(null);
  const [teamCount, setTeamCount] = useState(2);
  const [teamNames, setTeamNames] = useState<string[]>(DEFAULT_TEAM_NAMES);
  const [namesText, setNamesText] = useState("");
  const [ageGroup, setAgeGroup] = useState(9);
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  const individualNames = namesText
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const canStart =
    mode === "class" ||
    (mode === "teams" &&
      teamNames.slice(0, teamCount).every((n) => n.trim().length > 0)) ||
    (mode === "individuals" && individualNames.length >= 1);

  const handleStart = () => {
    if (!mode) return;
    let players: Player[] = [];
    if (mode === "teams") {
      players = teamNames.slice(0, teamCount).map((name, i) => ({
        id: `t${i}`,
        name: name.trim(),
        score: 0,
      }));
    } else if (mode === "individuals") {
      players = individualNames.map((name, i) => ({
        id: `i${i}`,
        name,
        score: 0,
      }));
    }
    onStart({ mode, players, ageGroup, customScenarios });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <div className="text-6xl mb-3">🎣</div>
        <h1
          className="font-extrabold text-white tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          The Bait &amp; Switch
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-seafoam font-semibold">
          A live cyber safety game for sharp minds 🐟
        </p>
      </header>

      <h2 className="mb-4 text-center text-xl font-bold text-white/90">
        Choose a game mode
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            { id: "class", emoji: "👥", label: "Whole Class", desc: "One shared score" },
            { id: "teams", emoji: "⚔️", label: "Team Battle", desc: "2–5 teams compete" },
            { id: "individuals", emoji: "🧒", label: "Individual Kids", desc: "Each kid scores solo" },
          ] as const
        ).map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              className={`rounded-3xl p-6 text-left transition-all min-h-[140px] ${
                active
                  ? "bg-sand text-slate-900 scale-105 shadow-2xl ring-4 ring-sand/40"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="text-4xl mb-2">{opt.emoji}</div>
              <div className="text-lg font-extrabold">{opt.label}</div>
              <div className={`text-sm ${active ? "text-slate-700" : "text-white/70"}`}>
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>

      {mode === "teams" && (
        <div className="mt-8 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-4">
            <label className="font-bold text-white">Number of teams</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
                className="h-11 w-11 rounded-full bg-white/20 text-xl font-bold text-white hover:bg-white/30"
              >
                −
              </button>
              <span className="w-8 text-center text-xl font-extrabold text-sand">
                {teamCount}
              </span>
              <button
                onClick={() => setTeamCount(Math.min(5, teamCount + 1))}
                className="h-11 w-11 rounded-full bg-white/20 text-xl font-bold text-white hover:bg-white/30"
              >
                +
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: teamCount }).map((_, i) => (
              <input
                key={i}
                value={teamNames[i] ?? ""}
                onChange={(e) => {
                  const next = [...teamNames];
                  next[i] = e.target.value;
                  setTeamNames(next);
                }}
                placeholder={`Team ${i + 1}`}
                className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-sand"
              />
            ))}
          </div>
        </div>
      )}

      {mode === "individuals" && (
        <div className="mt-8 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <label className="mb-2 block font-bold text-white">
            Kids' names (comma or new line separated)
          </label>
          <textarea
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            rows={4}
            placeholder="Aanya, Rohan, Maya, Kabir..."
            className="w-full rounded-2xl border-0 bg-white/90 px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-4 focus:ring-sand"
          />
          <div className="mt-2 text-sm text-white/70">
            {individualNames.length} player{individualNames.length === 1 ? "" : "s"} added
          </div>
        </div>
      )}

      <div className="mt-8">
        <AgeGroupPicker value={ageGroup} onChange={setAgeGroup} />
      </div>

      <div className="mt-6">
        <CustomQuestionEditor
          ageGroup={ageGroup}
          customScenarios={customScenarios}
          onChange={setCustomScenarios}
        />
      </div>

      <p className="mt-8 text-center text-sm text-white/70 italic">
        💡 Tip: Let kids hold up their Red/Green cards and discuss out loud before you reveal!
      </p>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="rounded-full bg-sand px-10 py-5 text-xl font-extrabold text-slate-900 shadow-2xl transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Start Game 🚀
        </button>
      </div>
    </div>
  );
}
