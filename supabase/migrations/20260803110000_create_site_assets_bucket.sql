/*
# Create site-assets storage bucket

## Changes

Creates the `site-assets` public storage bucket used by AdminSettings to upload
logo and favicon images, along with appropriate RLS policies:
- Public (anon) SELECT so images are accessible without auth
- Authenticated admin-only INSERT, UPDATE, DELETE
*/

-- Create the bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read objects in the bucket (needed for public image URLs)
DROP POLICY IF EXISTS "site_assets_public_select" ON storage.objects;
CREATE POLICY "site_assets_public_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

-- Allow authenticated admins to upload objects
DROP POLICY IF EXISTS "site_assets_admin_insert" ON storage.objects;
CREATE POLICY "site_assets_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND is_admin());

-- Allow authenticated admins to update (upsert) objects
DROP POLICY IF EXISTS "site_assets_admin_update" ON storage.objects;
CREATE POLICY "site_assets_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND is_admin());

-- Allow authenticated admins to delete objects
DROP POLICY IF EXISTS "site_assets_admin_delete" ON storage.objects;
CREATE POLICY "site_assets_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND is_admin());
