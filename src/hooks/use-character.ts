import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import type { ShopSlot } from "@/lib/shop";

export type Dressup = {
  skin: string;
  hair: string;
  hairstyle: "short" | "long" | "bun" | "bald";
  hat: string | null;
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  accessory: string | null;
};

export const DEFAULT_DRESSUP: Dressup = {
  skin: "#f1c9a5",
  hair: "#3b2a1a",
  hairstyle: "short",
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  accessory: null,
};

export type Character = {
  id: string;
  name: string;
  bio: string | null;
  avatar: string;
  accent: string;
  coins: number;
  dressup: Dressup;
  created_at: string;
  updated_at: string;
};

export type CharacterDraft = {
  name: string;
  bio: string;
  avatar: string;
  accent: string;
};

function normalizeDressup(raw: unknown): Dressup {
  if (!raw || typeof raw !== "object") return DEFAULT_DRESSUP;
  return { ...DEFAULT_DRESSUP, ...(raw as Partial<Dressup>) };
}

export function useCharacter() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("characters")
      .select("id, name, bio, avatar, accent, coins, dressup, created_at, updated_at")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (error) {
      setError(error.message);
      setCharacter(null);
      setOwnedItems([]);
    } else if (data) {
      const c: Character = {
        ...data,
        dressup: normalizeDressup(data.dressup),
      };
      setCharacter(c);
      const items = await supabase
        .from("character_items")
        .select("item_id")
        .eq("character_id", c.id);
      setOwnedItems((items.data ?? []).map((r) => r.item_id));
    } else {
      setCharacter(null);
      setOwnedItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (draft: CharacterDraft) => {
    const deviceId = getDeviceId();
    const payload = {
      device_id: deviceId,
      name: draft.name.trim(),
      bio: draft.bio.trim() || null,
      avatar: draft.avatar,
      accent: draft.accent,
    };
    const { data, error } = await supabase
      .from("characters")
      .upsert(payload, { onConflict: "device_id" })
      .select("id, name, bio, avatar, accent, coins, dressup, created_at, updated_at")
      .single();
    if (error) throw error;
    const c: Character = { ...data, dressup: normalizeDressup(data.dressup) };
    setCharacter(c);
    return c;
  }, []);

  const purchase = useCallback(
    async (itemId: string, price: number) => {
      if (!character) throw new Error("No character yet");
      const { data, error } = await supabase.rpc("purchase_item", {
        _character_id: character.id,
        _item_id: itemId,
        _price: price,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      const newCoins = row?.coins ?? character.coins;
      setCharacter({ ...character, coins: newCoins });
      setOwnedItems((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
      return newCoins as number;
    },
    [character],
  );

  const equipItem = useCallback(
    async (slot: ShopSlot, itemId: string | null) => {
      if (!character) return;
      const next: Dressup = { ...character.dressup, [slot]: itemId };
      setCharacter({ ...character, dressup: next });
      const { error } = await supabase
        .from("characters")
        .update({ dressup: next })
        .eq("id", character.id);
      if (error) throw error;
    },
    [character],
  );

  const updateAppearance = useCallback(
    async (patch: Partial<Pick<Dressup, "skin" | "hair" | "hairstyle">>) => {
      if (!character) return;
      const next: Dressup = { ...character.dressup, ...patch };
      setCharacter({ ...character, dressup: next });
      const { error } = await supabase
        .from("characters")
        .update({ dressup: next })
        .eq("id", character.id);
      if (error) throw error;
    },
    [character],
  );

  return {
    character,
    ownedItems,
    loading,
    error,
    refresh,
    save,
    purchase,
    equipItem,
    updateAppearance,
  };
}
