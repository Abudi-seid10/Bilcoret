/*
# Site Settings & YouTube URL Support

## Summary
1. Adds a `site_settings` table to store logo_url and favicon_url,
   manageable from the admin panel.
2. Adds `youtube_url` column to podcasts (podcasts are on YouTube).
3. Adds `email_campaigns` table to track campaigns sent to registered users.

## New Tables

### site_settings
- key (text, PK)
- value (text)
- updated_at (timestamptz)

### email_campaigns
- id (uuid, PK)
- subject (text, not null)
- body (text, not null)
- sent_at (timestamptz)
- sent_by (uuid, references auth.users)
- recipient_count (integer)

## Changes
- podcasts: adds youtube_url (text) column

## Security
- site_settings: public SELECT, admin-only INSERT/UPDATE/DELETE
- email_campaigns: admin-only SELECT/INSERT
*/

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "admin_insert_site_settings" ON site_settings;
CREATE POLICY "admin_insert_site_settings"
ON site_settings FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings"
ON site_settings FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_site_settings" ON site_settings;
CREATE POLICY "admin_delete_site_settings"
ON site_settings FOR DELETE
TO authenticated
USING (is_admin());

-- Seed default settings
INSERT INTO site_settings (key, value)
VALUES ('logo_url', NULL), ('favicon_url', NULL)
ON CONFLICT (key) DO NOTHING;

-- Add youtube_url to podcasts
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS youtube_url text;

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  sent_by uuid REFERENCES auth.users(id),
  recipient_count integer DEFAULT 0
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_email_campaigns" ON email_campaigns;
CREATE POLICY "admin_select_email_campaigns"
ON email_campaigns FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_email_campaigns" ON email_campaigns;
CREATE POLICY "admin_insert_email_campaigns"
ON email_campaigns FOR INSERT
TO authenticated
WITH CHECK (is_admin());
