import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bait & Switch — Cyber Safety Workshop" },
      {
        name: "description",
        content:
          "A live, facilitator-run classroom game that teaches kids 7–12 how to spot phishing and online scams.",
      },
      { property: "og:title", content: "The Bait & Switch — Cyber Safety Workshop" },
      {
        property: "og:description",
        content:
          "A live, facilitator-run classroom game that teaches kids 7–12 how to spot phishing and online scams.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
