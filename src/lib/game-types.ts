export type GameMode = "class" | "teams" | "individuals";

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Phase = "setup" | "question" | "reveal" | "end";

export const DEFAULT_TEAM_NAMES = [
  "Cyber Sharks",
  "Firewall Foxes",
  "Code Crackers",
  "Net Ninjas",
  "Data Dragons",
];
