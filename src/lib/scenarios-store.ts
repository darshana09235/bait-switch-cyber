import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CustomScenario, AgeBucket } from "./game-types";

const DEVICE_ID_KEY = "bs:deviceId";

function generateDeviceId(): string {
  // Crypto.randomUUID() is available in all modern browsers + Node 19+
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback: 32 random hex chars
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
    // localStorage unavailable — fall back to an ephemeral id (won't persist
    // but at least lets queries run within the page lifetime)
    return generateDeviceId();
  }
}

let _client: SupabaseClient<Database> | null = null;
let _clientDeviceId: string | null = null;

function getClient(): SupabaseClient<Database> {
  const deviceId = getDeviceId();
  if (_client && _clientDeviceId === deviceId) return _client;
  const url = import.meta.env.VITE_SUPABASE_URL as string;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  _client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { headers: { "x-device-id": deviceId } },
  });
  _clientDeviceId = deviceId;
  return _client;
}

type Row = {
  id: string;
  device_id: string;
  sender: string;
  message: string;
  verdict: "fake" | "safe";
  why: string;
  tricky: boolean;
  age_groups: string[];
};

function rowToScenario(r: Row): CustomScenario {
  return {
    id: r.id,
    custom: true,
    sender: r.sender,
    message: r.message,
    verdict: r.verdict,
    why: r.why,
    tricky: r.tricky,
    ageGroups: r.age_groups as AgeBucket[],
  };
}

export async function listCustomScenarios(): Promise<CustomScenario[]> {
  const supabase = getClient();
  // Type the response broadly — the generated types haven't been regenerated yet.
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("custom_scenarios")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(rowToScenario);
}

export async function upsertCustomScenario(s: CustomScenario): Promise<void> {
  const supabase = getClient();
  const row = {
    id: s.id,
    device_id: getDeviceId(),
    sender: s.sender,
    message: s.message,
    verdict: s.verdict,
    why: s.why,
    tricky: Boolean(s.tricky),
    age_groups: s.ageGroups,
  };
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("custom_scenarios")
    .upsert(row, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteCustomScenario(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("custom_scenarios")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listHiddenBuiltIns(): Promise<string[]> {
  const supabase = getClient();
  const { data, error } = await (supabase as unknown as SupabaseClient)
    .from("hidden_builtins")
    .select("scenario_id");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { scenario_id: string }[]).map((r) => r.scenario_id);
}

export async function hideBuiltIn(scenarioId: string): Promise<void> {
  const supabase = getClient();
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("hidden_builtins")
    .upsert(
      { device_id: getDeviceId(), scenario_id: scenarioId },
      { onConflict: "device_id,scenario_id" },
    );
  if (error) throw new Error(error.message);
}

export async function restoreAllBuiltIns(): Promise<void> {
  const supabase = getClient();
  const { error } = await (supabase as unknown as SupabaseClient)
    .from("hidden_builtins")
    .delete()
    .eq("device_id", getDeviceId());
  if (error) throw new Error(error.message);
}
