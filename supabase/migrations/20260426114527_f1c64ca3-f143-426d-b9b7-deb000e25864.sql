CREATE TABLE public.quest_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  quest_id text NOT NULL,
  period_key text NOT NULL,
  claimed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (device_id, quest_id, period_key)
);

CREATE INDEX idx_quest_claims_device_period ON public.quest_claims (device_id, period_key);

ALTER TABLE public.quest_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read quest claims"
  ON public.quest_claims FOR SELECT
  USING (true);

CREATE POLICY "Public can insert quest claims"
  ON public.quest_claims FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can delete quest claims"
  ON public.quest_claims FOR DELETE
  USING (true);