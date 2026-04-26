CREATE OR REPLACE FUNCTION public.purchase_item(_character_id uuid, _item_id text, _price integer)
 RETURNS TABLE(coins integer, owned boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_coins integer;
  v_owned boolean;
BEGIN
  SELECT c.coins INTO v_coins FROM public.characters c WHERE c.id = _character_id FOR UPDATE;
  IF v_coins IS NULL THEN
    RAISE EXCEPTION 'character not found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.character_items ci
    WHERE ci.character_id = _character_id AND ci.item_id = _item_id
  ) INTO v_owned;

  IF v_owned THEN
    RETURN QUERY SELECT v_coins, true;
    RETURN;
  END IF;

  IF v_coins < _price THEN
    RAISE EXCEPTION 'not enough coins';
  END IF;

  UPDATE public.characters AS c
    SET coins = c.coins - _price, updated_at = now()
    WHERE c.id = _character_id
    RETURNING c.coins INTO v_coins;

  INSERT INTO public.character_items (character_id, item_id) VALUES (_character_id, _item_id);

  RETURN QUERY SELECT v_coins, true;
END;
$function$;