ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS skin_type smallint,
  ADD COLUMN IF NOT EXISTS age_group text,
  ADD COLUMN IF NOT EXISTS clothing text;