import type { Scenario, AgeBucket } from "@/data/scenarios";

export type GameMode = "class" | "teams" | "individuals";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Phase = "setup" | "question" | "reveal" | "end";

export type { AgeBucket };

export type CustomScenario = Scenario & { id: string; custom: true };

export type SetupPayload = {
  mode: GameMode;
  players: Player[];
  ageGroups: AgeBucket[];
  customScenarios: CustomScenario[];
};

export const DEFAULT_TEAM_NAMES = [
  "Cyber Sharks",
  "Firewall Foxes",
  "Code Crackers",
  "Net Ninjas",
  "Data Dragons",
];
