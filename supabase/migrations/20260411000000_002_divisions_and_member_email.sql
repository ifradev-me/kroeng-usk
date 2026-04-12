/*
  # Divisions Management & Member Pre-registration

  1. Changes
    - Add `email` column to `members` table for pre-registered members
      (admin can add members by email without them needing to sign up first)
    - Update `handle_new_user` trigger to auto-link member records by email
      when a user registers with a matching email

  2. Why
    - Admin needs to batch-register many members by email
    - Members don't need to access the website individually to be registered
    - When a pre-registered member later signs up, they're auto-linked
*/

-- Add email column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS email text;

-- Update handle_new_user to auto-link pre-registered member records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );

  -- Auto-link any member records pre-registered with this email
  UPDATE public.members
  SET profile_id = new.id
  WHERE email = new.email AND profile_id IS NULL;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
