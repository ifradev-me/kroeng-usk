/*
  # Storage Policies for Images Bucket

  1. Create the `images` storage bucket (public)
  2. Allow authenticated users to upload their own avatars
  3. Allow public read access to all images
  4. Allow users to delete/update their own avatars
  5. Allow admins to upload to all folders
*/

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];


-- ============================================================================
-- PUBLIC READ: Anyone can view images
-- ============================================================================
CREATE POLICY "Public can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');


-- ============================================================================
-- AVATAR UPLOAD: Authenticated users can upload to avatars/ folder
-- ============================================================================
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
  );


-- ============================================================================
-- AVATAR UPDATE: Authenticated users can update files in avatars/ folder
-- ============================================================================
CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
  )
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
  );


-- ============================================================================
-- AVATAR DELETE: Authenticated users can delete files in avatars/ folder
-- ============================================================================
CREATE POLICY "Authenticated users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'avatars'
  );


-- ============================================================================
-- ADMIN FULL ACCESS: Admins can manage all images (gallery, news, etc.)
-- ============================================================================
CREATE POLICY "Admins can upload any image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update any image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete any image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
