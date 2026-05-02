-- Add nim (Nomor Induk Mahasiswa) column to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nim text;
