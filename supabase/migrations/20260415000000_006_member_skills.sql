-- Add skills column to members table
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Backfill skills from approved member_applications by profile_id
UPDATE public.members m
SET skills = a.skills
FROM public.member_applications a
WHERE m.profile_id = a.profile_id
  AND a.status = 'approved'
  AND a.skills IS NOT NULL
  AND array_length(a.skills, 1) > 0;
