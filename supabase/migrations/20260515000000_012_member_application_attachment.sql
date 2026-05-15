/*
  # Member Application Attachments

  1. Add `attachment_urls` column (text[]) to member_applications
     untuk menyimpan lampiran (CV, sertifikat, portfolio PDF, dll).
     Maksimal 5 file per pendaftaran (di-enforce di sisi client).

  2. Create `attachments` storage bucket
     - Public read
     - Authenticated users boleh upload ke folder applications/
     - Allowed types: image (jpeg/png/webp) + PDF
     - Max 10 MB per file
*/

-- ============================================================================
-- COLUMN: attachment_urls di member_applications
-- ============================================================================
ALTER TABLE member_applications
  ADD COLUMN IF NOT EXISTS attachment_urls text[] DEFAULT '{}';


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

-- Public read
CREATE POLICY "Public can view attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'attachments');

-- User authenticated boleh upload ke folder applications/
CREATE POLICY "Authenticated can upload applications"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'attachments'
    AND (storage.foldername(name))[1] = 'applications'
  );

-- Admin boleh hapus
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
