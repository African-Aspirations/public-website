-- Least-privilege Postgres roles. Supabase is used ONLY as hosted Postgres:
-- no Supabase Auth, no Data API. Identity is Firebase; these roles only limit
-- what each app's connection string can do if it ever leaks.
--
-- Roles are created NOLOGIN here. Give each one a password ONCE, out of band
-- (never committed), e.g. in the Supabase SQL editor:
--   ALTER ROLE web_build WITH LOGIN PASSWORD '<generated>';
--   ALTER ROLE web_forms WITH LOGIN PASSWORD '<generated>';
--   ALTER ROLE admin_app WITH LOGIN PASSWORD '<generated>';
-- Then connect through the pooler as  <role>.<project-ref>.

-- 1. Shut the Supabase HTTP API roles out of our schema (belt and braces:
--    the Data API is also switched off in the dashboard).
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;
--> statement-breakpoint

-- 2. App roles.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_build') THEN CREATE ROLE web_build NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_forms') THEN CREATE ROLE web_forms NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_app') THEN CREATE ROLE admin_app NOLOGIN; END IF;
END $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO web_build, web_forms, admin_app;
--> statement-breakpoint

-- 3. Row-level security on every table. Policies are per ROLE (not per JWT).
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '__drizzle%' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    -- admin_app: full CRUD on everything (authorization is done in the admin
    -- server from Firebase custom claims before any query runs).
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO admin_app', t);
    EXECUTE format('CREATE POLICY admin_all ON public.%I FOR ALL TO admin_app USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- 4. web_build: read-only, published content only. Never leads or staff.
DO $$
DECLARE t text;
BEGIN
  -- tables with a publish status: only published rows are visible
  FOREACH t IN ARRAY ARRAY['pages','page_sections','services','team_members','partners','faqs','posts','listings'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO web_build', t);
    EXECUTE format($p$CREATE POLICY build_read_published ON public.%I FOR SELECT TO web_build USING (status = 'published')$p$, t);
  END LOOP;
  -- tables without a status: fully readable
  FOREACH t IN ARRAY ARRAY['media','site_settings','nav_items','redirects','service_features','listing_categories','listing_images'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO web_build', t);
    EXECUTE format('CREATE POLICY build_read_all ON public.%I FOR SELECT TO web_build USING (true)', t);
  END LOOP;
END $$;
--> statement-breakpoint

-- 5. web_forms: insert-only for leads. It cannot read leads back.
GRANT INSERT ON public.contact_messages, public.listing_inquiries TO web_forms;
CREATE POLICY forms_insert ON public.contact_messages FOR INSERT TO web_forms WITH CHECK (status = 'new');
CREATE POLICY forms_insert ON public.listing_inquiries FOR INSERT TO web_forms WITH CHECK (status = 'new');
-- needs to look up the published listing an inquiry is about (for the email)
GRANT SELECT ON public.listings TO web_forms;
CREATE POLICY forms_read_published ON public.listings FOR SELECT TO web_forms USING (status = 'published');
--> statement-breakpoint

-- Newsletter + rate limiting go through SECURITY DEFINER functions so the
-- forms role never gets SELECT/UPDATE on the subscriber list.
CREATE OR REPLACE FUNCTION public.newsletter_subscribe(p_email text, p_token text)
RETURNS text  -- 'pending' (send confirmation) | 'already_confirmed'
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s subscriber_status;
BEGIN
  SELECT status INTO s FROM newsletter_subscribers WHERE email = lower(p_email);
  IF s = 'confirmed' THEN RETURN 'already_confirmed'; END IF;
  INSERT INTO newsletter_subscribers (email, status, confirm_token)
  VALUES (lower(p_email), 'pending', p_token)
  ON CONFLICT (email) DO UPDATE SET status = 'pending', confirm_token = p_token, updated_at = now();
  RETURN 'pending';
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.newsletter_confirm(p_token text)
RETURNS text  -- the confirmed email, or NULL if the token is unknown
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e text;
BEGIN
  UPDATE newsletter_subscribers
     SET status = 'confirmed', confirmed_at = now(), confirm_token = NULL, updated_at = now()
   WHERE confirm_token = p_token AND status = 'pending'
  RETURNING email INTO e;
  RETURN e;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.newsletter_set_resend_id(p_email text, p_resend_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE newsletter_subscribers SET resend_contact_id = p_resend_id WHERE email = lower(p_email);
$$;
--> statement-breakpoint
-- Fixed-window rate limit. Returns true when the request is allowed.
CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_ip_hash text, p_route text, p_window_seconds int, p_max int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE w timestamptz := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
DECLARE c int;
BEGIN
  INSERT INTO rate_limits (ip_hash, route, window_start, count) VALUES (p_ip_hash, p_route, w, 1)
  ON CONFLICT (ip_hash, route, window_start) DO UPDATE SET count = rate_limits.count + 1
  RETURNING count INTO c;
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 day';
  RETURN c <= p_max;
END $$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.newsletter_subscribe(text, text), public.newsletter_confirm(text),
  public.newsletter_set_resend_id(text, text), public.rate_limit_hit(text, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_subscribe(text, text), public.newsletter_confirm(text),
  public.newsletter_set_resend_id(text, text), public.rate_limit_hit(text, text, int, int) TO web_forms;
