import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import type { CategoryId } from "@/lib/journal-categories";

export type JournalEntry = {
  id: string;
  category: CategoryId;
  title: string;
  fun_fact: string | null;
  image_path: string;
  image_url: string;
  quest_title: string | null;
  created_at: string;
};

const BUCKET = "journal-sketches";

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function publicUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, category, title, fun_fact, image_path, quest_title, created_at")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setEntries([]);
    } else {
      setEntries(
        (data ?? []).map((row) => ({
          ...row,
          category: row.category as CategoryId,
          image_url: publicUrl(row.image_path),
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(
    async (input: {
      sketchDataUrl: string;
      category: CategoryId;
      title: string;
      funFact: string;
      questTitle?: string | null;
    }) => {
      const deviceId = getDeviceId();
      const blob = dataUrlToBlob(input.sketchDataUrl);
      const path = `${deviceId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const upload = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type,
        upsert: false,
      });
      if (upload.error) throw upload.error;

      const insert = await supabase
        .from("journal_entries")
        .insert({
          device_id: deviceId,
          category: input.category,
          title: input.title,
          fun_fact: input.funFact,
          image_path: path,
          quest_title: input.questTitle ?? null,
        })
        .select("id, category, title, fun_fact, image_path, quest_title, created_at")
        .single();

      if (insert.error) throw insert.error;

      const newEntry: JournalEntry = {
        ...insert.data,
        category: insert.data.category as CategoryId,
        image_url: publicUrl(insert.data.image_path),
      };
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    [],
  );

  return { entries, loading, error, refresh, addEntry };
}