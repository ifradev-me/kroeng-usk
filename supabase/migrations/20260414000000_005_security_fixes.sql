/*
  # Security Fixes Migration

  1. [CRITICAL] Fix profile update policy - prevent users from changing their own role
     - Drop existing "Users can update own profile" policy
     - Create new policy that ensures role cannot be self-modified

  2. [CRITICAL] Add missing DELETE policy for contacts table
     - Admins need to be able to delete contact messages

  3. [HIGH] Add unique partial index on member_applications
     - Prevent users from spamming multiple pending applications
*/

-- ============================================================================
-- C1: Fix profile role escalation vulnerability
-- Users should NOT be able to change their own role field
-- ============================================================================
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );


-- ============================================================================
-- C2: Add missing DELETE policy for contacts
-- Admin UI calls delete but no RLS policy existed
-- ============================================================================
CREATE POLICY "Admins can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ============================================================================
-- H4: Prevent duplicate pending member applications per user
-- Only one pending application per profile_id at a time
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_pending_application_per_user
  ON member_applications (profile_id)
  WHERE status = 'pending';
