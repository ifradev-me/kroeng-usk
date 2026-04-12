/*
  # Member Applications Table

  1. New Table
    - `member_applications` — pendaftaran anggota dari halaman /profile
      Fields:
        - id (uuid, PK)
        - profile_id (uuid, FK → profiles)
        - name, email, phone, whatsapp (text)
        - nim, year (text — info akademik)
        - division_id (uuid, FK → divisions)
        - position (text)
        - division_reason, experience, motivation (text)
        - skills (text[])
        - portfolio_url (text)
        - status ('pending' | 'approved' | 'rejected')
        - rejected_reason (text)
        - reviewed_by (uuid, FK → profiles)
        - reviewed_at (timestamptz)
        - created_at, updated_at (timestamptz)

  2. Cleanup
    - Drop divisions.outside_link dan divisions.inside_link
      Alasan: kolom ditambahkan di migration 003 tapi tidak ada di
      tipe Division, tidak pernah di-select atau di-query di kode manapun.

  3. Security
    - RLS diaktifkan
    - User hanya bisa insert/select aplikasi milik sendiri
    - Admin bisa lihat dan update semua
*/

-- ============================================================================
-- CLEANUP: Hapus kolom tidak terpakai di divisions
-- ============================================================================
ALTER TABLE divisions
  DROP COLUMN IF EXISTS outside_link,
  DROP COLUMN IF EXISTS inside_link;


-- ============================================================================
-- NEW TABLE: member_applications
-- ============================================================================
CREATE TABLE IF NOT EXISTS member_applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Informasi personal
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text,
  whatsapp        text,

  -- Informasi akademik
  nim             text,
  year            text,

  -- Divisi & posisi
  division_id     uuid REFERENCES divisions(id) ON DELETE SET NULL,
  position        text NOT NULL,

  -- Detail pendaftaran
  division_reason text,
  skills          text[] DEFAULT '{}',
  experience      text,
  motivation      text,
  portfolio_url   text,

  -- Status review
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason text,
  reviewed_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,

  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE member_applications ENABLE ROW LEVEL SECURITY;

-- Hapus dulu kalau sudah ada (idempotent)
DROP POLICY IF EXISTS "Users can view own applications"  ON member_applications;
DROP POLICY IF EXISTS "Users can insert own application" ON member_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON member_applications;
DROP POLICY IF EXISTS "Admins can update applications"   ON member_applications;
DROP POLICY IF EXISTS "Admins can delete applications"   ON member_applications;

-- User hanya bisa melihat dan membuat aplikasi milik sendiri
CREATE POLICY "Users can view own applications"
  ON member_applications FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own application"
  ON member_applications FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Admin bisa lihat semua
CREATE POLICY "Admins can view all applications"
  ON member_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin bisa update (approve/reject)
CREATE POLICY "Admins can update applications"
  ON member_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admin bisa hapus
CREATE POLICY "Admins can delete applications"
  ON member_applications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_member_applications_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER member_applications_updated_at
  BEFORE UPDATE ON member_applications
  FOR EACH ROW EXECUTE FUNCTION update_member_applications_updated_at();
