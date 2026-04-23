
-- Categories enum for journal entries
CREATE TYPE public.journal_category AS ENUM (
  'tree', 'plant', 'flower', 'bird', 'insect', 'mushroom', 'stone', 'water', 'sky', 'other'
);

-- Journal entries table
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  category public.journal_category NOT NULL,
  title TEXT NOT NULL,
  fun_fact TEXT,
  image_path TEXT NOT NULL,
  quest_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX journal_entries_device_idx ON public.journal_entries (device_id, created_at DESC);
CREATE INDEX journal_entries_category_idx ON public.journal_entries (device_id, category);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- No auth in this app yet. Allow public read/insert/delete (scoped client-side by device_id).
CREATE POLICY "Public can read journal entries"
  ON public.journal_entries FOR SELECT
  USING (true);

CREATE POLICY "Public can insert journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can delete journal entries"
  ON public.journal_entries FOR DELETE
  USING (true);

-- Storage bucket for sketches (public so we can render <img src> directly)
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal-sketches', 'journal-sketches', true);

-- Allow public uploads / reads / deletes on the journal-sketches bucket
CREATE POLICY "Public can read journal sketches"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'journal-sketches');

CREATE POLICY "Public can upload journal sketches"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'journal-sketches');

CREATE POLICY "Public can delete journal sketches"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'journal-sketches');
