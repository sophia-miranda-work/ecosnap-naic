import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import type { ShopSlot } from "@/lib/shop";
import type { AgeGroup, Clothing, SkinType } from "@/lib/vitamin-d";

export type Hairstyle =
  | "soft-bob"
  | "long-bangs"
  | "straight-bangs"
  | "curtain-cut"
  | "high-pony"
  | "low-pigtails"
  | "space-buns"
  | "fluffy-curls"
  | "twin-braids"
  | "side-sweep"
  | "bald"
  // Legacy saved values still render, but the picker no longer offers them.
  | "short"
  | "long"
  | "bun"
  | "curly"
  | "ponytail"
  | "pigtails";

/** Extended hairstyle catalog. Older values are kept for back-compat. */
export type HairStyleId =
  | Hairstyle
  | "afro"
  | "side-bun"
  | "double-bun"
  | "braids"
  | "fade"
  | "mohawk"
  | "bob"
  | "wavy"
  | "topknot"
  | "undercut"
  | "dreads"
  | "side-pony"
  | "long-pigtails"
  | "afro-short";

export type FaceShape = "round" | "oval" | "heart" | "diamond" | "octagon" | "long" | "square";
export type BodyShape = "slim" | "average" | "stocky";

export type EyebrowStyle = "none" | "soft-arch" | "straight" | "thick" | "thin" | "raised";
export type FacialHairStyle = "none" | "stubble" | "mustache" | "goatee" | "full-beard";

export type BangStyle =
  | "default"
  | "none"
  | "soft"
  | "side-swept"
  | "wispy"
  | "curtain"
  | "anime"
  | "blunt"
  | "curly";

export type Dressup = {
  skin: string;
  hair: string;
  hairstyle: HairStyleId;
  hat: string | null;
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  accessory: string | null;
  // ---- new optional fields (defaults below) ----
  faceShape?: FaceShape;
  bodyShape?: BodyShape;
  headSize?: number;
  nail?: string | null; // nail polish color hex, or null
  earrings?: string | null; // item id
  necklace?: string | null;
  bracelet?: string | null;
  hairClip?: string | null;
  earPiercing?: string | null;
  facePiercing?: string | null;
  ears?: string | null; // hearing aid / earpods / headphones
  dress?: string | null; // covers top+bottom for dresses
  eyebrows?: EyebrowStyle;
  facialHair?: FacialHairStyle;
  bangs?: BangStyle;
};

export const DEFAULT_DRESSUP: Dressup = {
  skin: "#f1c9a5",
  hair: "#3b2a1a",
  hairstyle: "soft-bob",
  hat: null,
  top: null,
  bottom: null,
  shoes: null,
  accessory: null,
  faceShape: "oval",
  bodyShape: "average",
  headSize: 1,
  nail: null,
  earrings: null,
  necklace: null,
  bracelet: null,
  hairClip: null,
  earPiercing: null,
  facePiercing: null,
  ears: null,
  dress: null,
  eyebrows: "none",
  facialHair: "none",
  bangs: "default",
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
  skin_type: SkinType | null;
  age_group: AgeGroup | null;
  clothing: Clothing | null;
};

export type CharacterDraft = {
  name: string;
  bio: string;
  avatar: string;
  accent: string;
};

function normalizeDressup(raw: unknown): Dressup {
  if (!raw || typeof raw !== "object") return DEFAULT_DRESSUP;
  const dressup = { ...DEFAULT_DRESSUP, ...(raw as Partial<Dressup>) };
  if (!dressup.headSize || typeof dressup.headSize !== "number") {
    dressup.headSize = 1;
  } else {
    dressup.headSize = Math.min(1.12, Math.max(0.86, dressup.headSize));
  }
  return dressup;
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
      .select(
        "id, name, bio, avatar, accent, coins, dressup, created_at, updated_at, skin_type, age_group, clothing",
      )
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
        skin_type: (data.skin_type as SkinType | null) ?? null,
        age_group: (data.age_group as AgeGroup | null) ?? null,
        clothing: (data.clothing as Clothing | null) ?? null,
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
      .select(
        "id, name, bio, avatar, accent, coins, dressup, created_at, updated_at, skin_type, age_group, clothing",
      )
      .single();
    if (error) throw error;
    const c: Character = {
      ...data,
      dressup: normalizeDressup(data.dressup),
      skin_type: (data.skin_type as SkinType | null) ?? null,
      age_group: (data.age_group as AgeGroup | null) ?? null,
      clothing: (data.clothing as Clothing | null) ?? null,
    };
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
    async (patch: Partial<Dressup>) => {
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

  const awardCoins = useCallback(
    async (amount: number) => {
      if (!character || amount <= 0) return character?.coins ?? 0;
      const deviceId = getDeviceId();
      const { data, error } = await supabase.rpc("award_coins", {
        _device_id: deviceId,
        _amount: amount,
      });
      if (error) throw error;
      const newBalance = typeof data === "number" ? data : character.coins + amount;
      setCharacter({ ...character, coins: newBalance });
      return newBalance;
    },
    [character],
  );

  const saveSunProfile = useCallback(
    async (profile: { skin: SkinType; age: AgeGroup; clothing: Clothing }) => {
      if (!character) return;
      const { error } = await supabase
        .from("characters")
        .update({
          skin_type: profile.skin,
          age_group: profile.age,
          clothing: profile.clothing,
        })
        .eq("id", character.id);
      if (error) throw error;
      setCharacter({
        ...character,
        skin_type: profile.skin,
        age_group: profile.age,
        clothing: profile.clothing,
      });
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
    awardCoins,
    saveSunProfile,
  };
}
