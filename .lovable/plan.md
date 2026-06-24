## Goal

Custom questions (and hidden built-in flags) should persist locally on the device using IndexedDB — no accounts, no cloud, surviving page refreshes and browser restarts. Today they're stored in Lovable Cloud keyed by a `device_id` in `localStorage`, which is fragile inside the Lovable preview iframe (the iframe storage partition can reset on dev-server restarts, orphaning the rows).

## Approach

Replace the Supabase-backed implementation inside `src/lib/scenarios-store.ts` with an IndexedDB-backed one. Keep the exported function signatures identical so no calling component (SetupScreen, etc.) needs to change.

### IndexedDB layout

- Database: `bullshield` (version 1)
- Object stores:
  - `custom_scenarios` — keyPath `id`, stores the full `CustomScenario` object
  - `hidden_builtins` — keyPath `scenario_id`, stores `{ scenario_id }`
- Use the native `indexedDB` API (no extra dependency) wrapped in small promise helpers. If IndexedDB is unavailable (private mode, very old browser), fall back to `localStorage` so the app still works for the session.

### Function rewrites (same signatures, sync→async unchanged)

- `listCustomScenarios()` → read all from `custom_scenarios`, sort by an internal `createdAt` timestamp we write on upsert
- `upsertCustomScenario(s)` → `put` into `custom_scenarios` (adds `createdAt` if missing)
- `deleteCustomScenario(id)` → `delete` from `custom_scenarios`
- `listHiddenBuiltIns()` → read all keys from `hidden_builtins`
- `hideBuiltIn(id)` → `put { scenario_id: id }`
- `restoreAllBuiltIns()` → `clear()` the `hidden_builtins` store
- `getDeviceId()` → keep as-is (still used elsewhere as a harmless stable id), but no longer drives storage

### One-time migration from Lovable Cloud → IndexedDB

On first load after this change, if the IndexedDB stores are empty, attempt one read from the existing Supabase tables using the current `device_id` and copy any rows into IndexedDB. This preserves any custom questions you previously created on this device. After the copy, set a flag `bs:idb-migrated=1` in `localStorage` so we don't re-run the migration.

### Cleanup

- Remove the `@supabase/supabase-js` `createClient` usage from this file (still used elsewhere via `@/integrations/supabase/client` for unrelated things).
- Leave the `custom_scenarios` and `hidden_builtins` database tables in place for now (harmless, and they're what the migration step reads from). We can drop them in a later cleanup once you're sure nothing is missing locally.

## Files touched

- `src/lib/scenarios-store.ts` — rewrite internals; same exported API.

No component, route, or DB migration changes needed.

## Trade-offs to be aware of

- Questions live only on this browser profile on this device. Clearing site data / using a different browser / using another device = empty list. That matches your stated requirement.
- Lovable's preview iframe still partitions storage in some cases, so during editing you may occasionally see an empty list inside the preview — but the published site runs on its own top-level origin where IndexedDB persists normally across refreshes and restarts.
