/*
  # Member Application Required Attachments

  1. Add lampiran columns ke member_applications (semua wajib di sisi client):
     - formulir_url           text     — PDF formulir pendaftaran
     - motivation_letter_url  text     — PDF surat motivasi
     - transkrip_urls         text[]   — daftar PDF transkrip nilai (bisa >1, mis. per semester)
     - photo_url              text     — pasfoto (gambar)

  2. Create `attachments` storage bucket
     - Public read
     - Authenticated users boleh upload ke folder applications/
     - Allowed types: image (jpeg/png/webp) + PDF
     - Max 10 MB per file
*/

-- ============================================================================
-- COLUMNS: lampiran wajib di member_applications
-- ============================================================================

-- Cleanup nama kolom lama (kalau migration sebelumnya pernah jalan)
ALTER TABLE member_applications
  DROP COLUMN IF EXISTS attachment_url,
  DROP COLUMN IF EXISTS attachment_urls,
  DROP COLUMN IF EXISTS transkrip_url;

ALTER TABLE member_applications
  ADD COLUMN IF NOT EXISTS formulir_url          text,
  ADD COLUMN IF NOT EXISTS motivation_letter_url text,
  ADD COLUMN IF NOT EXISTS transkrip_urls        text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS photo_url             text;


-- ============================================================================
-- STORAGE BUCKET: attachments
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attachments',
  'attachments',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];


-- ============================================================================
-- POLICIES untuk bucket attachments
-- ============================================================================
DROP POLICY IF EXISTS "Public can view attachments"           ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload applications" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete attachments"         ON storage.objects;

CREATE POLICY "Public can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

CREATE POLICY "Authenticated can upload applications"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = 'applications'
  );

CREATE POLICY "Admins can delete attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
