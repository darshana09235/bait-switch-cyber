
CREATE OR REPLACE FUNCTION public.current_device_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT nullif(
    (current_setting('request.headers', true)::json ->> 'x-device-id'),
    ''
  );
$$;
