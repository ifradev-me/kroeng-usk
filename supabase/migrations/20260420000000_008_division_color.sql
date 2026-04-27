-- Add color column to divisions table
ALTER TABLE public.divisions
  ADD COLUMN IF NOT EXISTS color text DEFAULT '#0ea5e9';
