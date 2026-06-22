## Goal

Make custom questions persist across refreshes, and let the facilitator permanently delete any question (custom or built-in) from the setup screen.

## 1. Persist setup state in localStorage

Add a tiny `useLocalStorage` hook (`src/hooks/use-local-storage.ts`) — SSR-safe (reads inside `useEffect` on mount, no access during render on the server).

In `SetupScreen.tsx`, back these with localStorage under keys:
- `bs:customScenarios` → `CustomScenario[]`
- `bs:deletedBuiltInIds` → `string[]` (see section 2)
- `bs:ageGroups` → `AgeBucket[]`

Effect: adding a custom question, deleting a built-in, or changing age group survives refresh and "Play Again".

## 2. Hard-delete built-in questions

Built-ins in `src/data/scenarios.ts` don't currently have stable IDs. Steps:

- Add a required `id: string` to every built-in scenario (e.g. `"b-roblox-trade"`, `"b-otp-share"`). Stable, human-readable, won't change between sessions.
- Update the `Scenario` type so `id` is required.
- "Hard delete" against a static code file isn't actually possible from the browser — we can't rewrite `scenarios.ts` at runtime. So the user-visible behavior is permanent removal *for this browser*: the ID goes into `bs:deletedBuiltInIds` in localStorage and the scenario is filtered out everywhere, forever, on that device. (Calling it "hard delete from the code" would require a server function that rewrites the file and a redeploy — out of scope for a session-only classroom tool. We'll label the button "Delete forever" and explain it's per-device in a small helper line.)

If you do want true source-file deletion later, that becomes a separate feature (server function + redeploy). Flag this if you want me to add it instead.

## 3. New "Question library" panel on the setup screen

Replace the current chip strip in `CustomQuestionEditor` with a unified list shown below the age picker:

```text
Questions for ages 8–10        [ 14 active · 2 hidden ]  [Restore hidden]
─────────────────────────────────────────────
🚩  "Click here to claim..."      Custom    [✏️] [🗑]
🟢  "Mom: pick up at 4"            Built-in  [🗑]
🚩  "Your Roblox account..."       Built-in  [🗑]
...
```

- Filters by currently selected age groups (matches `Game.tsx` logic).
- Each row: verdict pill, sender + message preview, source tag, delete button. Custom rows also get an edit button (opens the existing editor pre-filled).
- "Restore hidden" clears `bs:deletedBuiltInIds`. No per-item restore (keeps UI simple).
- Confirmation: small inline "Are you sure?" on click — no modal dialog needed.

## 4. Apply deletions to gameplay

In `Game.tsx`, the `allScenarios` memo already filters by age. Add a second filter: `!deletedBuiltInIds.includes(s.id)`. Pass `deletedBuiltInIds` through `SetupPayload`.

## Files touched

- `src/data/scenarios.ts` — add stable `id` to every built-in
- `src/lib/game-types.ts` — `id` required on `Scenario`; add `deletedBuiltInIds: string[]` to `SetupPayload`
- `src/hooks/use-local-storage.ts` — new
- `src/components/SetupScreen.tsx` — wire localStorage, render new library panel
- `src/components/QuestionLibrary.tsx` — new, the unified list
- `src/components/CustomQuestionEditor.tsx` — support edit mode (pre-fill from existing custom)
- `src/components/Game.tsx` — accept and apply `deletedBuiltInIds`

## Out of scope

- Cross-device sync (no account system).
- Editing built-in scenarios' text/verdict (only delete).
- Rewriting `src/data/scenarios.ts` from the browser.
