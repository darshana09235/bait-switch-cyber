# The Bait & Switch — Build Plan

A self-contained, single-page React app for a facilitator-led cyber safety workshop. No backend, no auth, no storage — all state lives in memory for the session.

## Visual direction

- Ocean / "Phisherman" theme: deep navy→teal gradient background (#063A5E → #042A45)
- Floating bubble particles drifting upward (pure CSS animation, low-cost)
- Accent tokens: coral `#FF5A5F` (danger), seafoam `#1FC6B6` (safe), sandy yellow `#FFD23F` (highlight/CTA)
- Rounded, high-contrast, kid-friendly. Generous spacing, large tap targets, short text.
- 🎣🐟 emoji accents in headers; phone-mockup card for scenario messages (white card, faux status bar, circular avatar initial, sender name, bold message text)

All colors added as semantic tokens in `src/styles.css` (`--ocean-deep`, `--ocean-mid`, `--coral`, `--seafoam`, `--sand`) and wired through `@theme inline` so utilities like `bg-coral`, `text-seafoam` work.

## App structure

Single route at `/` (replace the placeholder `src/routes/index.tsx`). One stateful container drives three screen phases: `setup` → `round` (with `question` / `reveal` sub-states) → `end`.

```
src/
  routes/
    index.tsx              # route + head metadata, renders <Game />
  components/
    Game.tsx               # top-level state machine
    SetupScreen.tsx        # mode picker + team/individual name entry
    RoundScreen.tsx        # round counter, scoreboard, phone card, Reveal button
    RevealScreen.tsx       # full-screen red/green verdict + scoring controls
    EndScreen.tsx          # modal: final score or ranked leaderboard
    PhoneCard.tsx          # phone-mockup message card
    Scoreboard.tsx         # class score OR team/individual list w/ 👑 leader
    Bubbles.tsx            # CSS background bubble particles
  data/
    scenarios.ts           # the 16 scenarios, in order
  lib/
    game-types.ts          # GameMode, Player, Scenario types
```

## Game state (in-memory only)

```ts
type GameMode = 'class' | 'teams' | 'individuals';
type Player = { id: string; name: string; score: number };
type Phase = 'setup' | 'question' | 'reveal' | 'end';

// state: mode, players[], classScore, roundIndex, phase
```

Scoring rules:
- `class` mode: one score, toggle button "✅ Class got it right (+1)" — tapping toggles between 0 and 1 for that round
- `teams` / `individuals`: one toggle button per player; multi-select allowed; tap again undoes
- Round-level award state is held separately and only committed when "Next Round" is tapped (or simply tracked per round so undo always works cleanly)

No timer anywhere. Setup screen shows a hint: "Let kids discuss out loud before you reveal."

## Screens

**SetupScreen**
- Three large mode cards (Whole Class / Team Battle / Individual Kids)
- Team Battle: number stepper 2–5, editable name inputs prefilled with playful defaults (Cyber Sharks, Firewall Foxes, Code Crackers, Net Ninjas, Data Dragons)
- Individual Kids: textarea, split on commas/newlines, trims empties
- "🚀 Start Game" disabled until mode chosen and (if applicable) at least 2 teams or 1 individual name

**RoundScreen**
- Header: "Round X of 16" + Scoreboard strip (👑 next to current leader; ties = crown on all tied leaders)
- PhoneCard with sender + message
- Single big CTA: "🔍 Reveal the Answer"

**RevealScreen (full-screen)**
- Solid red or green gradient fills the viewport with a quick fade-in (~200ms)
- Big verdict text: "🚩 RED CARD!" or "🟢 GREEN CARD!"
- Translucent rounded card quoting the original message in italics
- "Why" explanation in calm, teacher-like tone
- "Tricky one!" badge on flagged scenarios (the ones designed to make kids pause — e.g. Roblox trade, Online Gaming Buddy, App Store update, GameZone hacked channel, Mom new number)
- Scoring controls per mode (see above)
- "Next Round ➜" button (becomes "See Results 🏆" on the last round)

**EndScreen** (modal overlay)
- Class mode: "🎉 Great Job, Cyber Defenders!" + score / 16
- Teams/Individuals: ranked list with 🥇🥈🥉 medals, winner banner "🏆 [Name] Wins!" (handle ties by sharing the medal)
- "Play Again" → resets scores and returns to Setup (mode/names re-chooseable)

## Content

All 16 scenarios from the prompt, in the given order, stored verbatim in `src/data/scenarios.ts` as `{ sender, message, verdict: 'fake' | 'safe', why, tricky?: boolean }`. The "tricky" flag is set on the scenarios designed to make kids pause (Family birthday, App Store update, Classmate Google Doc, Roblox same-time trade, School Portal login, Online Gaming Buddy — i.e. SAFE ones that pattern-match to "suspicious", plus Mom-new-number which looks safe but isn't).

## Responsiveness & projector readability

- Fluid type scale using `clamp()` so headings stay huge on TVs/projectors and readable on tablets
- Layout uses flex/grid with a max-width container; everything centers
- Tap targets ≥ 56px; reveal verdict text uses `clamp(4rem, 12vw, 10rem)`

## Animations

- Bubble particles: 8–12 absolutely-positioned divs with staggered `animation-delay` rising via `@keyframes`
- Reveal transition: simple opacity + scale fade-in on the full-screen color layer (~200ms). No slow transitions.

## Tech notes

- Tailwind v4 tokens in `src/styles.css` only — no `tailwind.config.js`
- No new dependencies needed; uses existing React + TanStack Start setup
- Pure client component (`'use client'` not needed in TanStack Start) — state via `useState`/`useReducer`
- `head()` in `index.tsx` updated: title "The Bait & Switch — Cyber Safety Workshop", matching description and OG tags

## Out of scope

- No login, no backend, no persistence (refresh = reset, by design)
- No per-student device input
- No timer
- No external APIs, no analytics
