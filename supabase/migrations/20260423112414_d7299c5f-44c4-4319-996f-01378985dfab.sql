-- 1. Coins + dress-up state on characters
ALTER TABLE public.characters
  ADD COLUMN coins integer NOT NULL DEFAULT 0,
  ADD COLUMN dressup jsonb NOT NULL DEFAULT '{"skin":"#f1c9a5","hair":"#3b2a1a","hairstyle":"short","hat":null,"top":null,"bottom":null,"shoes":null,"accessory":null}'::jsonb;

-- 2. Track which shop items each character owns (simple junction, idempotent insert)
CREATE TABLE public.character_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (character_id, item_id)
);

CREATE INDEX idx_character_items_character ON public.character_items(character_id);

ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read character items"
  ON public.character_items FOR SELECT TO public USING (true);

CREATE POLICY "Public can insert character items"
  ON public.character_items FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public can delete character items"
  ON public.character_items FOR DELETE TO public USING (true);

-- 3. Atomic purchase RPC (avoids race conditions on coins)
CREATE OR REPLACE FUNCTION public.purchase_item(
  _character_id uuid,
  _item_id text,
  _price integer
) RETURNS TABLE (coins integer, owned boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_coins integer;
  already_owned boolean;
BEGIN
  SELECT c.coins INTO current_coins FROM public.characters c WHERE c.id = _character_id FOR UPDATE;
  IF current_coins IS NULL THEN
    RAISE EXCEPTION 'character not found';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.character_items WHERE character_id = _character_id AND item_id = _item_id)
    INTO already_owned;

  IF already_owned THEN
    RETURN QUERY SELECT current_coins, true;
    RETURN;
  END IF;

  IF current_coins < _price THEN
    RAISE EXCEPTION 'not enough coins';
  END IF;

  UPDATE public.characters SET coins = coins - _price, updated_at = now() WHERE id = _character_id
    RETURNING coins INTO current_coins;

  INSERT INTO public.character_items (character_id, item_id) VALUES (_character_id, _item_id);

  RETURN QUERY SELECT current_coins, true;
END;
$$;

-- 4. Award coins RPC (called after journal entry save)
CREATE OR REPLACE FUNCTION public.award_coins(
  _device_id text,
  _amount integer
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.characters
    SET coins = coins + _amount, updated_at = now()
    WHERE device_id = _device_id
    RETURNING coins INTO new_balance;
  RETURN COALESCE(new_balance, 0);
END;
$$;