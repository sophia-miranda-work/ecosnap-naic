import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";

export type Character = {
  id: string;
  name: string;
  bio: string | null;
  avatar: string;
  accent: string;
  created_at: string;
  updated_at: string;
};

export type CharacterDraft = {
  name: string;
  bio: string;
  avatar: string;
  accent: string;
};

export function useCharacter() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("characters")
      .select("id, name, bio, avatar, accent, created_at, updated_at")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (error) {
      setError(error.message);
      setCharacter(null);
    } else {
      setCharacter(data ?? null);
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
      .select("id, name, bio, avatar, accent, created_at, updated_at")
      .single();
    if (error) throw error;
    setCharacter(data);
    return data as Character;
  }, []);

  return { character, loading, error, refresh, save };
}
