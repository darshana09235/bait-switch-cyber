## Goal

Add two features to The Bait & Switch:
1. An **age group selector** (5–14) on the setup screen that tunes the difficulty/tone of explanations.
2. A **"Add your own question"** flow where the facilitator types a message, marks it Red (fake) or Green (safe), and the app **auto-generates the "Why?" explanation** using AI — appropriate to the selected age group.

## UX Flow

**Setup screen (additions, above "Start Game"):**
- New section: **"Age group"** — a horizontal slider/segmented control from **5 to 14**, default 9. Shows selected age large (e.g. "Ages 9").
- New section: **"Custom questions (optional)"** — a list of added questions + an "➕ Add a question" button that opens an inline composer:
  - Sender field (e.g. "Unknown Number")
  - Message textarea
  - Two big buttons: **🚩 Red Card (fake)** / **🟢 Green Card (safe)**
  - Optional "Tricky one" toggle
  - **"✨ Generate explanation"** button → calls AI, fills a read-only "Why?" preview the facilitator can edit
  - **Save** / **Cancel**
- Saved custom questions appear as chips with edit/delete; they are **shuffled into the round list** in front of the built-ins (or interleaved — see below).

**During play:** no visual difference between built-in and custom questions.

## AI Generation

- Use **Lovable AI Gateway** via a TanStack `createServerFn` (`src/lib/explanations.functions.ts`).
- Input: `{ sender, message, verdict: 'fake' | 'safe', tricky, ageGroup }`.
- Output: a single 1–2 sentence "why" string, written in the voice of a kind teacher, vocabulary tuned to the age (younger = shorter words, more concrete; older = can reference concepts like 2FA, phishing, urgency tactics).
- Model: `google/gemini-2.5-flash` (fast, cheap, good for short structured text). No streaming needed — single short response.
- Uses `generateText` from `ai` + the gateway provider. Returns `{ why: string }`.
- Frontend shows a spinner on the **"✨ Generate explanation"** button, then fills the textarea. Facilitator can re-generate or hand-edit.

This requires **Lovable Cloud** to be enabled (for the AI Gateway key). Plan will enable it as the first build step.

## Data Model Changes

`src/lib/game-types.ts`:
- Add `AgeGroup = number` (5–14).
- Extend `Scenario` import or define `CustomScenario` = same shape as `Scenario` + `id: string`, `custom: true`.

`Game.tsx` state additions:
- `ageGroup: number` (default 9)
- `customScenarios: Scenario[]`
- Final round list = `[...customScenarios, ...scenarios]` (customs first so facilitator sees their own content early), or shuffled — **defaulting to "customs first, then built-ins in order"** for predictability. Total rounds derived from the combined array.

`SetupScreen` props grow to pass back `{ mode, players, ageGroup, customScenarios }`.

## Files to Change / Create

**Create:**
- `src/lib/explanations.functions.ts` — `generateExplanation` server function (AI call).
- `src/components/AgeGroupPicker.tsx` — segmented 5–14 selector.
- `src/components/CustomQuestionEditor.tsx` — inline add/edit composer with the "Generate" button.

**Edit:**
- `src/lib/game-types.ts` — add `AgeGroup`, extend setup payload type.
- `src/components/SetupScreen.tsx` — mount the two new sections; pass new fields up.
- `src/components/Game.tsx` — store `ageGroup` + `customScenarios`; combine with built-in scenarios for the round list.

**Enable:** Lovable Cloud (required for AI Gateway).

No changes to RoundScreen / RevealScreen / EndScreen — custom scenarios reuse the same shape, so they render unchanged.

## Out of Scope

- Persisting custom questions across reloads (in-memory only, matches existing app).
- Editing built-in scenarios.
- Re-generating "why" for built-in scenarios per age group (built-in `why` text stays as authored; only custom questions use AI).
- Translations / non-English output.

## Open Question

For built-in scenarios, the existing `why` text is one fixed sentence. Do you also want those rewritten by AI to match the selected age group, or keep built-ins fixed and only auto-generate for custom questions? **Default in this plan: built-ins stay fixed, AI only powers custom questions** (faster, no cost per round, predictable classroom content).
