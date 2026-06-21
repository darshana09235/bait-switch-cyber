import { useMemo, useState } from "react";
import type { GameMode, Phase, Player, SetupPayload, CustomScenario } from "@/lib/game-types";
import { scenarios } from "@/data/scenarios";
import type { Scenario } from "@/data/scenarios";
import { Bubbles } from "./Bubbles";
import { SetupScreen } from "./SetupScreen";
import { RoundScreen } from "./RoundScreen";
import { RevealScreen } from "./RevealScreen";
import { EndScreen } from "./EndScreen";

export function Game() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [mode, setMode] = useState<GameMode>("class");
  const [players, setPlayers] = useState<Player[]>([]);
  const [classScore, setClassScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  // per-round award state (not yet committed to scores)
  const [classGotIt, setClassGotIt] = useState(false);
  const [awardedIds, setAwardedIds] = useState<Set<string>>(new Set());

  const allScenarios = useMemo<Scenario[]>(
    () => [...customScenarios, ...scenarios],
    [customScenarios]
  );
  const totalRounds = allScenarios.length;
  const scenario = allScenarios[roundIndex];
  const isLastRound = roundIndex === totalRounds - 1;

  const handleStart = (payload: SetupPayload) => {
    setMode(payload.mode);
    setPlayers(payload.players);
    setCustomScenarios(payload.customScenarios);
    setClassScore(0);
    setRoundIndex(0);
    setClassGotIt(false);
    setAwardedIds(new Set());
    setPhase("question");
  };

  const handleReveal = () => {
    setClassGotIt(false);
    setAwardedIds(new Set());
    setPhase("reveal");
  };

  const handleNext = () => {
    // commit scores
    if (mode === "class" && classGotIt) {
      setClassScore((s) => s + 1);
    } else if (mode !== "class" && awardedIds.size > 0) {
      setPlayers((prev) =>
        prev.map((p) => (awardedIds.has(p.id) ? { ...p, score: p.score + 1 } : p))
      );
    }

    if (isLastRound) {
      setPhase("end");
    } else {
      setRoundIndex((i) => i + 1);
      setPhase("question");
    }
  };

  const togglePlayer = (id: string) => {
    setAwardedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePlayAgain = () => {
    setPhase("setup");
    setPlayers([]);
    setCustomScenarios([]);
    setClassScore(0);
    setRoundIndex(0);
    setClassGotIt(false);
    setAwardedIds(new Set());
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-ocean-deep via-[#053453] to-ocean-mid text-white overflow-x-hidden">
      <Bubbles />

      {phase === "setup" && <SetupScreen onStart={handleStart} />}

      {(phase === "question" || phase === "reveal" || phase === "end") && (
        <RoundScreen
          mode={mode}
          players={players}
          classScore={classScore}
          roundIndex={roundIndex}
          totalRounds={totalRounds}
          scenario={scenario}
          onReveal={handleReveal}
        />
      )}

      {phase === "reveal" && (
        <RevealScreen
          mode={mode}
          players={players}
          scenario={scenario}
          isLastRound={isLastRound}
          classGotIt={classGotIt}
          awardedIds={awardedIds}
          onToggleClass={() => setClassGotIt((v) => !v)}
          onTogglePlayer={togglePlayer}
          onNext={handleNext}
        />
      )}

      {phase === "end" && (
        <EndScreen
          mode={mode}
          players={players}
          classScore={classScore}
          totalRounds={totalRounds}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
