import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import type { CategoryId } from "@/lib/journal-categories";
import {
  TIER_META,
  TIER_REWARD,
  getActiveQuests,
  periodKeyForTier,
  periodStart,
  type ActiveQuestSet,
  type Quest,
} from "@/lib/quests";

type ProgressRow = { category: CategoryId; created_at: string };

export type QuestStatus = {
  quest: Quest;
  progress: number;
  goal: number;
  reward: number;
  claimed: boolean;
  /** True when progress meets goal but reward hasn't been claimed yet. */
  ready: boolean;
  periodKey: string;
};

export function useQuests() {
  const [active, setActive] = useState<ActiveQuestSet>(() => getActiveQuests());
  const [entries, setEntries] = useState<ProgressRow[]>([]);
  const [claims, setClaims] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const now = new Date();
    const set = getActiveQuests(now);
    setActive(set);

    // We need entries from the start of the longest active period (the month).
    const monthStart = periodStart("monthly", now);

    const [entriesRes, claimsRes] = await Promise.all([
      supabase
        .from("journal_entries")
        .select("category, created_at")
        .eq("device_id", deviceId)
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("quest_claims")
        .select("quest_id, period_key")
        .eq("device_id", deviceId)
        .in("period_key", [set.weekKey, set.monthKey]),
    ]);

    if (entriesRes.error) setError(entriesRes.error.message);
    setEntries(
      (entriesRes.data ?? []).map((r) => ({
        category: r.category as CategoryId,
        created_at: r.created_at,
      })),
    );

    if (claimsRes.error) setError(claimsRes.error.message);
    setClaims(
      new Set((claimsRes.data ?? []).map((r) => `${r.quest_id}:${r.period_key}`)),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const statusFor = useCallback(
    (quest: Quest): QuestStatus => {
      const rotation = TIER_META[quest.tier].rotation;
      const periodKey = rotation === "monthly" ? active.monthKey : active.weekKey;
      const start = periodStart(rotation);
      const matching = entries.filter(
        (e) =>
          new Date(e.created_at) >= start &&
          quest.categories.includes(e.category),
      );
      const progress = Math.min(quest.count, matching.length);
      const claimed = claims.has(`${quest.id}:${periodKey}`);
      return {
        quest,
        progress,
        goal: quest.count,
        reward: TIER_REWARD[quest.tier],
        claimed,
        ready: !claimed && progress >= quest.count,
        periodKey,
      };
    },
    [active, entries, claims],
  );

  const statuses = useMemo(
    () => ({
      bronze: active.bronze.map(statusFor),
      silver: active.silver.map(statusFor),
      gold: active.gold.map(statusFor),
    }),
    [active, statusFor],
  );

  const claim = useCallback(
    async (quest: Quest) => {
      const status = statusFor(quest);
      if (status.claimed) return { coins: null, alreadyClaimed: true };
      if (!status.ready) throw new Error("Quest not complete yet");
      const deviceId = getDeviceId();
      const periodKey = periodKeyForTier(quest.tier);

      // Insert the claim row first; the unique constraint protects against
      // double-claims even on flaky networks.
      const insertRes = await supabase.from("quest_claims").insert({
        device_id: deviceId,
        quest_id: quest.id,
        period_key: periodKey,
      });
      if (insertRes.error) {
        // 23505 = unique violation -> already claimed. Treat as success.
        if (insertRes.error.code !== "23505") throw insertRes.error;
        setClaims((prev) => new Set(prev).add(`${quest.id}:${periodKey}`));
        return { coins: null, alreadyClaimed: true };
      }

      const reward = TIER_REWARD[quest.tier];
      const { data: balance, error: rpcErr } = await supabase.rpc("award_coins", {
        _device_id: deviceId,
        _amount: reward,
      });
      if (rpcErr) throw rpcErr;

      setClaims((prev) => new Set(prev).add(`${quest.id}:${periodKey}`));
      return { coins: typeof balance === "number" ? balance : null, alreadyClaimed: false };
    },
    [statusFor],
  );

  return { statuses, active, loading, error, refresh, claim };
}