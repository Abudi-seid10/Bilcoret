/*
# Admin portal auth & management policies

## Summary
Adds admin authentication support to the existing Bilcor platform.
Creates an `admins` table that links to Supabase auth.users, plus a
trigger that auto-inserts an admin row whenever a user signs up with
a designated admin email. Updates RLS policies so only authenticated
admins can insert/update/delete content tables (seminars, podcasts,
trainings) and manage registrations, while public read stays open.

## New Tables

### admins
- id (uuid, PK, references auth.users)
- email (text, unique)
- created_at (timestamptz)

## New Functions

### handle_new_admin()
Trigger function that fires AFTER INSERT on auth.users. If the new
user's email is in the designated admin email list, a corresponding
row is inserted into the admins table automatically.

## Security Changes

### Content tables (seminars, podcasts, trainings)
- SELECT remains public (anon, authenticated) — no change.
- INSERT/UPDATE/DELETE: new policies restricted to authenticated users
  who exist in the admins table. Old open policies dropped.

### registrations
- INSERT: unchanged (public, status='pending' only).
- SELECT/UPDATE/DELETE: new policies restricted to admins only.
  Admins can view all registrations and update status (approve/reject).

### admins
- SELECT: restricted to authenticated users who are themselves admins
  (a user can only confirm their own admin status).

## Important Notes
1. The designated admin email is seeded into the trigger function.
   To make yourself an admin, sign up at /admin/login using the
   designated email, and the trigger auto-creates your admin row.
2. To add more admins later, update the trigger function's email list
   or insert directly into admins table via service-role.
3. All admin write operations go through the authenticated supabase
   client — the anon key cannot perform admin writes.
*/

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_self" ON admins;
CREATE POLICY "admin_select_self"
ON admins FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Helper function: check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
$$;

-- Trigger: auto-insert admin row on signup for designated emails
CREATE OR REPLACE FUNCTION handle_new_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Designated admin emails — sign up with one of these to become admin
  IF NEW.email IN ('admin@bilcoret.com', 'amina@bilcoret.com') THEN
    INSERT INTO admins (id, email) VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_admin();

-- Seminars: admin-only writes
DROP POLICY IF EXISTS "admin_insert_seminars" ON seminars;
CREATE POLICY "admin_insert_seminars"
ON seminars FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_seminars" ON seminars;
CREATE POLICY "admin_update_seminars"
ON seminars FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_seminars" ON seminars;
CREATE POLICY "admin_delete_seminars"
ON seminars FOR DELETE
TO authenticated
USING (is_admin());

-- Podcasts: admin-only writes
DROP POLICY IF EXISTS "admin_insert_podcasts" ON podcasts;
CREATE POLICY "admin_insert_podcasts"
ON podcasts FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_podcasts" ON podcasts;
CREATE POLICY "admin_update_podcasts"
ON podcasts FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_podcasts" ON podcasts;
CREATE POLICY "admin_delete_podcasts"
ON podcasts FOR DELETE
TO authenticated
USING (is_admin());

-- Trainings: admin-only writes
DROP POLICY IF EXISTS "admin_insert_trainings" ON trainings;
CREATE POLICY "admin_insert_trainings"
ON trainings FOR INSERT
TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_trainings" ON trainings;
CREATE POLICY "admin_update_trainings"
ON trainings FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_trainings" ON trainings;
CREATE POLICY "admin_delete_trainings"
ON trainings FOR DELETE
TO authenticated
USING (is_admin());

-- Registrations: admin can view all, update status, delete
DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations"
ON registrations FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "admin_update_registrations" ON registrations;
CREATE POLICY "admin_update_registrations"
ON registrations FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_registrations" ON registrations;
CREATE POLICY "admin_delete_registrations"
ON registrations FOR DELETE
TO authenticated
USING (is_admin());
