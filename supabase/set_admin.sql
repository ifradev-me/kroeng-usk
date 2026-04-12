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
  affected     int;
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE email = target_email;

  GET DIAGNOSTICS affected = ROW_COUNT;

  IF affected = 0 THEN
    RAISE EXCEPTION 'Akun dengan email "%" tidak ditemukan. Pastikan sudah daftar dulu via website.', target_email;
  ELSE
    RAISE NOTICE 'Berhasil! Akun "%" sekarang adalah admin.', target_email;
  END IF;
END $$;

-- Verifikasi: lihat semua admin yang ada
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at;
