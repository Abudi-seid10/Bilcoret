/*
# Fix registrations INSERT RLS policy

## Problem
The existing `public_insert_registrations` policy used `WITH CHECK (true)`,
which allowed any caller (anon or authenticated) to insert a row with any
value in any column — including setting `status` to 'approved', 'rejected',
or any arbitrary string, effectively bypassing the intended workflow where
only administrators should change registration status.

## Fix
Replace the always-true check with a constraint that enforces the only
legitimate initial value: `status = 'pending'`. This means:

- External callers can still submit registrations without being signed in
  (the app has no auth screen), so the policy remains `TO anon, authenticated`.
- The `WITH CHECK` now requires `status = 'pending'`, preventing any caller
  from self-assigning an elevated status on insert.
- Status transitions (e.g. to 'approved') must be performed server-side via
  a privileged role (service-role key), not through the public anon-key API.

## Security Changes
- DROP existing unrestricted INSERT policy on `registrations`.
- CREATE new INSERT policy restricting inserted rows to `status = 'pending'`.
*/

DROP POLICY IF EXISTS "public_insert_registrations" ON registrations;

CREATE POLICY "public_insert_registrations"
ON registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'pending');
