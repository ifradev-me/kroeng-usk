/*
  ============================================================================
  Clear Seed Data
  ============================================================================
  Menghapus semua data contoh tanpa menyentuh akun user / auth.
  Aman dijalankan kapanpun — tidak mereset schema, hanya data.

  Jalankan di: Supabase Dashboard → SQL Editor
  ============================================================================
*/

TRUNCATE TABLE
  member_applications,
  members,
  gallery,
  achievements,
  knowledge,
  news,
  contacts,
  divisions
RESTART IDENTITY CASCADE;

-- profiles TIDAK di-truncate supaya akun user/admin yang sudah
-- dibuat tetap ada dan bisa login.

-- Verifikasi semua tabel kosong
SELECT 'divisions'          AS tabel, COUNT(*) AS sisa FROM divisions
UNION ALL
SELECT 'members',                     COUNT(*)          FROM members
UNION ALL
SELECT 'news',                        COUNT(*)          FROM news
UNION ALL
SELECT 'achievements',                COUNT(*)          FROM achievements
UNION ALL
SELECT 'gallery',                     COUNT(*)          FROM gallery
UNION ALL
SELECT 'knowledge',                   COUNT(*)          FROM knowledge
UNION ALL
SELECT 'contacts',                    COUNT(*)          FROM contacts
UNION ALL
SELECT 'member_applications',         COUNT(*)          FROM member_applications
UNION ALL
SELECT 'profiles (tidak dihapus)',    COUNT(*)          FROM profiles;
