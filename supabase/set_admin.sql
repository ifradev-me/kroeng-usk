/*
  ============================================================================
  Set Admin Role
  ============================================================================
  Jalankan di: Supabase Dashboard → SQL Editor

  LANGKAH:
  1. Daftar akun dulu via website (/login atau /register)
  2. Ganti 'EMAIL_KAMU_DI_SINI' dengan email yang sudah didaftarkan
  3. Jalankan query ini
  4. Logout → login ulang di website
  ============================================================================
*/

-- Ganti email di bawah ini
DO $$
DECLARE
  target_email text := 'EMAIL_KAMU_DI_SINI';
  auth_user    auth.users%ROWTYPE;
  affected     int;
BEGIN
  -- Cari user di auth.users berdasarkan email
  SELECT * INTO auth_user FROM auth.users WHERE email = target_email;

  IF auth_user.id IS NULL THEN
    RAISE EXCEPTION 'Email "%" tidak ditemukan di auth. Pastikan sudah daftar via website dulu.', target_email;
  END IF;

  -- Kalau profile belum ada (trigger gagal saat signup), buat dulu
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    auth_user.id,
    auth_user.email,
    auth_user.raw_user_meta_data->>'full_name',
    auth_user.raw_user_meta_data->>'avatar_url',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin';

  GET DIAGNOSTICS affected = ROW_COUNT;

  RAISE NOTICE 'Berhasil! Akun "%" sekarang adalah admin.', target_email;
END $$;

-- Verifikasi: lihat semua admin yang ada
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at;
