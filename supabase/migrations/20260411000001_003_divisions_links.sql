/*
  # Division Links & Member Social Links

  1. Changes
    - Add `outside_link` to divisions — link ke halaman eksternal (Instagram, website resmi divisi, dll)
    - Add `inside_link` to divisions — link ke halaman internal website (cth: /divisions/electrical)
*/

ALTER TABLE divisions
  ADD COLUMN IF NOT EXISTS outside_link text,
  ADD COLUMN IF NOT EXISTS inside_link text;
