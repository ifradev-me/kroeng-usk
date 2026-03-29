-- ============================================================================
-- KROENG WEBSITE - SUPABASE RESET/CLEANUP SCRIPT
-- ============================================================================
-- WARNING: This script will DELETE ALL DATA and reset your database!
-- Only use this for development/testing purposes.
-- ============================================================================

-- Drop views first
DROP VIEW IF EXISTS stats_summary;
DROP VIEW IF EXISTS published_knowledge;
DROP VIEW IF EXISTS published_news;
DROP VIEW IF EXISTS members_with_division;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_news_updated_at ON news;
DROP TRIGGER IF EXISTS update_knowledge_updated_at ON knowledge;
DROP TRIGGER IF EXISTS auto_slug_news ON news;
DROP TRIGGER IF EXISTS auto_slug_knowledge ON knowledge;
DROP TRIGGER IF EXISTS set_news_published_at ON news;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS generate_slug(TEXT);
DROP FUNCTION IF EXISTS auto_generate_news_slug();
DROP FUNCTION IF EXISTS auto_generate_knowledge_slug();
DROP FUNCTION IF EXISTS set_published_at();
DROP FUNCTION IF EXISTS is_admin();

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS knowledge CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS contact_status;
DROP TYPE IF EXISTS user_role;

-- Delete storage buckets content (optional - uncomment if needed)
-- DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'images');
-- DELETE FROM storage.buckets WHERE id IN ('avatars', 'images');

-- ============================================================================
-- Database has been reset!
-- Run supabase-setup.sql to recreate everything.
-- ============================================================================