
CREATE TABLE public.custom_scenarios (
  id text PRIMARY KEY,
  device_id text NOT NULL,
  sender text NOT NULL DEFAULT 'Unknown',
  message text NOT NULL,
  verdict text NOT NULL CHECK (verdict IN ('fake','safe')),
  why text NOT NULL,
  tricky boolean NOT NULL DEFAULT false,
  age_groups text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX custom_scenarios_device_idx ON public.custom_scenarios(device_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_scenarios TO anon, authenticated;
GRANT ALL ON public.custom_scenarios TO service_role;

ALTER TABLE public.custom_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read custom scenarios"
  ON public.custom_scenarios FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can insert custom scenarios"
  ON public.custom_scenarios FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can update custom scenarios"
  ON public.custom_scenarios FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anyone can delete custom scenarios"
  ON public.custom_scenarios FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.hidden_builtins (
  device_id text NOT NULL,
  scenario_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (device_id, scenario_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hidden_builtins TO anon, authenticated;
GRANT ALL ON public.hidden_builtins TO service_role;

ALTER TABLE public.hidden_builtins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read hidden builtins"
  ON public.hidden_builtins FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can insert hidden builtins"
  ON public.hidden_builtins FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can delete hidden builtins"
  ON public.hidden_builtins FOR DELETE TO anon, authenticated USING (true);
