/*
# Add site_settings and email_campaigns tables

## Changes

### site_settings (new table)
Stores a single row of site-wide settings, keyed by name "default".
- id (uuid, PK)
- logo_url (text) — URL of uploaded logo (stored in Supabase Storage or external)
- favicon_url (text) — URL of uploaded favicon
- updated_at (timestamptz)

### email_campaigns (new table)
Records email campaigns sent by admins.
- id (uuid, PK)
- subject (text, not null)
- body_html (text) — HTML body of the email
- body_text (text) — plain-text body
- audience (text, default 'all') — 'all' | 'seminar' | 'training'
- sent_at (timestamptz)
- sent_count (integer, default 0)
- created_at (timestamptz)
*/

-- site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url text,
  favicon_url text,
  updated_at timestamptz DEFAULT now()
);

-- Seed a default row
INSERT INTO site_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings" ON site_settings
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  body_html text,
  body_text text,
  audience text NOT NULL DEFAULT 'all',
  sent_at timestamptz,
  sent_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_email_campaigns" ON email_campaigns;
CREATE POLICY "admin_all_email_campaigns" ON email_campaigns
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
