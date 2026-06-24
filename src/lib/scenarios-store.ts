import type { CustomScenario, AgeBucket } from "./game-types";

const DEVICE_ID_KEY = "bs:deviceId";
const MIGRATION_FLAG_KEY = "bs:idb-migrated";
const DB_NAME = "bullshield";
const DB_VERSION = 1;
const STORE_SCENARIOS = "custom_scenarios";
const STORE_HIDDEN = "hidden_builtins";

function generateDeviceId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  let out = "";
  for (let i = 0; i < 32; i++) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr-no-device";
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY);
    if (!id || id.length < 16) {
      id = generateDeviceId();
      window.localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return generateDeviceId();
  }
}

// ---------- IndexedDB helpers ----------

type StoredScenario = CustomScenario & { createdAt: number };
type StoredHidden = { scenario_id: string; createdAt: number };

let _dbPromise: Promise<IDBDatabase> | null = null;

function hasIDB(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SCENARIOS)) {
        db.createObjectStore(STORE_SCENARIOS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_HIDDEN)) {
        db.createObjectStore(STORE_HIDDEN, { keyPath: "scenario_id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
  return _dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        let result: T;
        Promise.resolve(fn(store))
          .then((r) => {
            // If fn returned an IDBRequest, wait for it
            if (r && typeof (r as IDBRequest).readyState === "string") {
              const req = r as unknown as IDBRequest<T>;
              req.onsuccess = () => {
                result = req.result;
              };
              req.onerror = () => reject(req.error);
            } else {
              result = r as T;
            }
          })
          .catch(reject);
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      }),
  );
}

function getAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const req = transaction.objectStore(storeName).getAll();
        req.onsuccess = () => resolve((req.result ?? []) as T[]);
        req.onerror = () => reject(req.error);
      }),
  );
}

// ---------- localStorage fallback ----------

const LS_SCENARIOS_KEY = "bs:customScenarios";
const LS_HIDDEN_KEY = "bs:hiddenBuiltins";

function lsReadScenarios(): StoredScenario[] {
  try {
    const raw = window.localStorage.getItem(LS_SCENARIOS_KEY);
    return raw ? (JSON.parse(raw) as StoredScenario[]) : [];
  } catch {
    return [];
  }
}
function lsWriteScenarios(list: StoredScenario[]) {
  try {
    window.localStorage.setItem(LS_SCENARIOS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
function lsReadHidden(): string[] {
  try {
    const raw = window.localStorage.getItem(LS_HIDDEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function lsWriteHidden(list: string[]) {
  try {
    window.localStorage.setItem(LS_HIDDEN_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

// ---------- One-time migration from cloud ----------

let _migrationPromise: Promise<void> | null = null;

async function migrateFromCloudOnce(): Promise<void> {
  if (typeof window === "undefined") return;
  if (_migrationPromise) return _migrationPromise;
  _migrationPromise = (async () => {
    try {
      if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return;
      // Only migrate when local stores are empty
      const existing = hasIDB()
        ? await getAll<StoredScenario>(STORE_SCENARIOS).catch(() => [])
        : lsReadScenarios();
      const existingHidden = hasIDB()
        ? await getAll<StoredHidden>(STORE_HIDDEN).catch(() => [])
        : lsReadHidden().map((id) => ({ scenario_id: id, createdAt: 0 }));
      if (existing.length === 0 && existingHidden.length === 0) {
        const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
        const deviceId = getDeviceId();
        if (url && key && deviceId && deviceId !== "ssr-no-device") {
          const headers = {
            apikey: key,
            authorization: `Bearer ${key}`,
            "x-device-id": deviceId,
            "content-type": "application/json",
          };
          // Fetch custom scenarios
          try {
            const r = await fetch(
              `${url}/rest/v1/custom_scenarios?select=*&order=created_at.asc`,
              { headers },
            );
            if (r.ok) {
              const rows = (await r.json()) as Array<{
                id: string;
                sender: string;
                message: string;
                verdict: "fake" | "safe";
                why: string;
                tricky: boolean;
                age_groups: string[];
                created_at: string;
              }>;
              for (const row of rows) {
                const s: StoredScenario = {
                  id: row.id,
                  custom: true,
                  sender: row.sender,
                  message: row.message,
                  verdict: row.verdict,
                  why: row.why,
                  tricky: row.tricky,
                  ageGroups: row.age_groups as AgeBucket[],
                  createdAt: new Date(row.created_at).getTime() || Date.now(),
                };
                await upsertCustomScenario(s);
              }
            }
          } catch {
            /* ignore network errors during migration */
          }
          // Fetch hidden built-ins
          try {
            const r = await fetch(
              `${url}/rest/v1/hidden_builtins?select=scenario_id`,
              { headers },
            );
            if (r.ok) {
              const rows = (await r.json()) as Array<{ scenario_id: string }>;
              for (const row of rows) await hideBuiltIn(row.scenario_id);
            }
          } catch {
            /* ignore */
          }
        }
      }
      window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    } catch {
      /* ignore */
    }
  })();
  return _migrationPromise;
}

// ---------- Public API ----------

function toScenario(s: StoredScenario): CustomScenario {
  return {
    id: s.id,
    custom: true,
    sender: s.sender,
    message: s.message,
    verdict: s.verdict,
    why: s.why,
    tricky: s.tricky,
    ageGroups: s.ageGroups,
  };
}

export async function listCustomScenarios(): Promise<CustomScenario[]> {
  await migrateFromCloudOnce();
  if (!hasIDB()) {
    return lsReadScenarios()
      .sort((a, b) => a.createdAt - b.createdAt)
      .map(toScenario);
  }
  const rows = await getAll<StoredScenario>(STORE_SCENARIOS);
  return rows.sort((a, b) => a.createdAt - b.createdAt).map(toScenario);
}

export async function upsertCustomScenario(s: CustomScenario): Promise<void> {
  const stored: StoredScenario = {
    id: s.id,
    custom: true,
    sender: s.sender,
    message: s.message,
    verdict: s.verdict,
    why: s.why,
    tricky: Boolean(s.tricky),
    ageGroups: s.ageGroups,
    createdAt: Date.now(),
  };
  if (!hasIDB()) {
    const list = lsReadScenarios();
    const idx = list.findIndex((x) => x.id === s.id);
    if (idx >= 0) {
      stored.createdAt = list[idx].createdAt; // preserve original order
      list[idx] = stored;
    } else {
      list.push(stored);
    }
    lsWriteScenarios(list);
    return;
  }
  // Preserve createdAt if already present
  await tx<void>(STORE_SCENARIOS, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const getReq = store.get(s.id);
      getReq.onsuccess = () => {
        const existing = getReq.result as StoredScenario | undefined;
        if (existing?.createdAt) stored.createdAt = existing.createdAt;
        const putReq = store.put(stored);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  });
}

export async function deleteCustomScenario(id: string): Promise<void> {
  if (!hasIDB()) {
    lsWriteScenarios(lsReadScenarios().filter((x) => x.id !== id));
    return;
  }
  await tx<void>(STORE_SCENARIOS, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

export async function listHiddenBuiltIns(): Promise<string[]> {
  await migrateFromCloudOnce();
  if (!hasIDB()) return lsReadHidden();
  const rows = await getAll<StoredHidden>(STORE_HIDDEN);
  return rows.map((r) => r.scenario_id);
}

export async function hideBuiltIn(scenarioId: string): Promise<void> {
  if (!hasIDB()) {
    const list = lsReadHidden();
    if (!list.includes(scenarioId)) {
      list.push(scenarioId);
      lsWriteHidden(list);
    }
    return;
  }
  await tx<void>(STORE_HIDDEN, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.put({ scenario_id: scenarioId, createdAt: Date.now() } satisfies StoredHidden);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}

export async function restoreAllBuiltIns(): Promise<void> {
  if (!hasIDB()) {
    lsWriteHidden([]);
    return;
  }
  await tx<void>(STORE_HIDDEN, "readwrite", (store) => {
    return new Promise<void>((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  });
}
