-- The form endpoints put the org name and address in email footers.
-- site_settings is public information (it's in every page footer).
GRANT SELECT ON public.site_settings TO web_forms;
CREATE POLICY forms_read_settings ON public.site_settings FOR SELECT TO web_forms USING (true);
