
-- Drop the permissive policies and replace with device-scoped ones that
-- check the x-device-id request header forwarded by PostgREST.

DROP POLICY IF EXISTS "anyone can read custom scenarios" ON public.custom_scenarios;
DROP POLICY IF EXISTS "anyone can insert custom scenarios" ON public.custom_scenarios;
DROP POLICY IF EXISTS "anyone can update custom scenarios" ON public.custom_scenarios;
DROP POLICY IF EXISTS "anyone can delete custom scenarios" ON public.custom_scenarios;

DROP POLICY IF EXISTS "anyone can read hidden builtins" ON public.hidden_builtins;
DROP POLICY IF EXISTS "anyone can insert hidden builtins" ON public.hidden_builtins;
DROP POLICY IF EXISTS "anyone can delete hidden builtins" ON public.hidden_builtins;

-- Security definer helper to read the x-device-id header from the request.
CREATE OR REPLACE FUNCTION public.current_device_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nullif(
    (current_setting('request.headers', true)::json ->> 'x-device-id'),
    ''
  );
$$;

REVOKE ALL ON FUNCTION public.current_device_id() FROM public;
GRANT EXECUTE ON FUNCTION public.current_device_id() TO anon, authenticated, service_role;

-- custom_scenarios policies
CREATE POLICY "device can read own custom scenarios"
  ON public.custom_scenarios FOR SELECT TO anon, authenticated
  USING (device_id = public.current_device_id());

CREATE POLICY "device can insert own custom scenarios"
  ON public.custom_scenarios FOR INSERT TO anon, authenticated
  WITH CHECK (device_id = public.current_device_id() AND length(device_id) >= 16);

CREATE POLICY "device can update own custom scenarios"
  ON public.custom_scenarios FOR UPDATE TO anon, authenticated
  USING (device_id = public.current_device_id())
  WITH CHECK (device_id = public.current_device_id());

CREATE POLICY "device can delete own custom scenarios"
  ON public.custom_scenarios FOR DELETE TO anon, authenticated
  USING (device_id = public.current_device_id());

-- hidden_builtins policies
CREATE POLICY "device can read own hidden builtins"
  ON public.hidden_builtins FOR SELECT TO anon, authenticated
  USING (device_id = public.current_device_id());

CREATE POLICY "device can insert own hidden builtins"
  ON public.hidden_builtins FOR INSERT TO anon, authenticated
  WITH CHECK (device_id = public.current_device_id() AND length(device_id) >= 16);

CREATE POLICY "device can delete own hidden builtins"
  ON public.hidden_builtins FOR DELETE TO anon, authenticated
  USING (device_id = public.current_device_id());
