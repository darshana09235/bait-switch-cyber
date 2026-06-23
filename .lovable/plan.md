## What's actually wrong

I reproduced the add → refresh flow on the running app and the custom question DID save and re-appear. That means the code works, but the place it saves to — the browser's localStorage — isn't reliable for you. The most likely cause is the Lovable preview: it runs your app inside an iframe, and many browsers (Chrome's storage partitioning, Safari ITP, private mode) clear or isolate iframe storage between sessions. From the user's point of view: "I typed it, it's gone."

The fix is to stop relying on the browser at all and store custom questions on the server.

## Plan

### 1. Turn on Lovable Cloud
One-time setup. Gives us a database we can read/write from server functions. Nothing for you to configure.

### 2. Two small tables

```text
custom_scenarios
  id           text  primary key   -- the same c-... id used today
  device_id    text  not null      -- random per-browser id
  sender       text
  message      text  not null
  verdict      text  not null      -- 'fake' | 'safe'
  why          text  not null
  tricky       boolean
  age_groups   text[]              -- e.g. {'8-10','11-14'}
  created_at   timestamptz default now()

hidden_builtins
  device_id    text  not null
  scenario_id  text  not null
  primary key (device_id, scenario_id)
```

Both tables are scoped by `device_id` — a random UUID generated once per browser and kept in localStorage (`bs:deviceId`). No login required. If localStorage is wiped, a new device id is minted, but the data on the server is not lost — we can also expose a "Restore from code" field later (a short code you can paste on another device to load that device's questions). Out of scope for this round.

RLS: allow anon read/write only where `device_id` matches a value supplied by the client. Simple, no auth.

### 3. Server functions (`src/lib/scenarios.functions.ts`)
- `listCustomScenarios({ deviceId })` → `CustomScenario[]`
- `upsertCustomScenario({ deviceId, scenario })`
- `deleteCustomScenario({ deviceId, id })`
- `listHiddenBuiltIns({ deviceId })` → `string[]`
- `hideBuiltIn({ deviceId, id })`
- `restoreAllBuiltIns({ deviceId })`

### 4. Wire the UI to the server
Replace the three `useLocalStorage` calls in `SetupScreen.tsx` with TanStack Query:
- `useQuery(['customScenarios', deviceId], listCustomScenarios)`
- `useMutation(upsertCustomScenario)` / `useMutation(deleteCustomScenario)` with `invalidateQueries`
- same pattern for hidden built-ins

Keep `bs:ageGroups` in localStorage — it's a UI preference, not data.

Keep the existing `CustomQuestionEditor` and `QuestionLibrary` components; only the data source changes. The "Saving…" / "Saved ✓" state from the mutation gives you visible feedback so you know it landed.

### 5. Files touched
- `src/lib/scenarios.functions.ts` (new) — six server functions above
- `src/lib/device-id.ts` (new) — `getDeviceId()` returns/creates the UUID
- `src/components/SetupScreen.tsx` — swap hooks
- supabase migration — create both tables + RLS policies + grants
- `src/hooks/use-local-storage.ts` — kept, used only for `bs:ageGroups` and `bs:deviceId`

### Out of scope
- Login / cross-device sync (would need real auth). I'll note "Restore code" as a future option once you confirm this fix works.
- Hard-deleting built-in questions from the source file (still per-device hide, as before).
