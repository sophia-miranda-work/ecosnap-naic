import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Coins, Check, Sparkles, Lock, ShoppingBag } from "lucide-react";
import { useCharacter } from "@/hooks/use-character";
import { SHOP_ITEMS, type ShopItem } from "@/lib/shop";
import { QUEST_GIVERS, getGiverById } from "@/lib/quest-givers";
import { getDisplayGiver, WINTER_SUBSTITUTES } from "@/lib/winter";
import { useSettings } from "@/hooks/use-settings";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Björn's Shop — EcoSnap" },
      { name: "description", content: "Spend your hard-earned coins on cozy clothes for your dress-up explorer." },
      { property: "og:title", content: "Björn's Shop — EcoSnap" },
      { property: "og:description", content: "Hats, jackets, and themed outfits from the woodland cast — picked out by Björn the bear." },
    ],
  }),
  component: ShopPage,
});

type SetTab = "all" | "basic" | "willow" | "professor-hoot" | "pip" | "mossback" | "clover";

function ShopPage() {
  const { character, ownedItems, purchase, equipItem } = useCharacter();
  const { t, halloweenActive, winterActive } = useSettings();
  const [tab, setTab] = useState<SetTab>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const items = SHOP_ITEMS.filter((i) => tab === "all" || i.set === tab);
  const coins = character?.coins ?? 0;
  const equipped = new Set(
    character
      ? [
          character.dressup.hat,
          character.dressup.top,
          character.dressup.bottom,
          character.dressup.shoes,
          character.dressup.accessory,
        ].filter((x): x is string => Boolean(x))
      : [],
  );

  async function handleBuy(item: ShopItem) {
    if (!character) return;
    setBusy(item.id);
    setFlash(null);
    try {
      await purchase(item.id, item.price);
      setFlash({ kind: "ok", msg: t("Got it — {x}!", { x: t(item.name) }) });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("Couldn't buy that.");
      setFlash({ kind: "err", msg: msg.includes("not enough") ? t("Not enough coins yet.") : msg });
    } finally {
      setBusy(null);
      setTimeout(() => setFlash(null), 2200);
    }
  }

  async function handleEquip(item: ShopItem) {
    if (!character) return;
    const slot = item.slot;
    const isEquipped = character.dressup[slot] === item.id;
    setBusy(item.id);
    try {
      await equipItem(slot, isEquipped ? null : item.id);
    } finally {
      setBusy(null);
    }
  }

  const TABS: { id: SetTab; label: string; emoji: string }[] = [
    { id: "all", label: t("All"), emoji: "🛍️" },
    { id: "basic", label: t("Basics"), emoji: "🧺" },
    ...QUEST_GIVERS.map((g) => {
      const d = getDisplayGiver(g.id, { halloweenActive, winterActive });
      return {
        id: g.id as SetTab,
        label: d.name,
        emoji: d.avatar,
      };
    }),
  ];

  const shopkeeper = winterActive && !halloweenActive ? WINTER_SUBSTITUTES.bjorn : null;
  const shopName = shopkeeper ? `${shopkeeper.name}'s Shop` : "Björn's Shop";
  const shopAvatar = shopkeeper?.avatar ?? "🐻";
  const shopWelcome = shopkeeper ? "Welcome to the iceberg" : "Welcome to the den";
  const shopBlurb = shopkeeper
    ? "\"Bring something cosy. The ice gets bitter.\""
    : "\"Pick something warm. The forest gets chilly.\"";

  return (
    <div className="px-5 pt-8 pb-8">
      {/* Björn header */}
      <header className="parchment-card relative overflow-hidden p-5">
        <div className="absolute -right-4 -top-4 text-[7rem] opacity-10 select-none" aria-hidden>
          {shopkeeper ? "🧊" : "🧸"}
        </div>
        <div className="relative flex items-start gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-card text-4xl shadow-inner ring-2 ring-border"
            aria-hidden
          >
            {shopAvatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t(shopWelcome)}
            </p>
            <h1 className="text-2xl font-bold text-foreground">{t(shopName)}</h1>
            {shopkeeper && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                ❄️ {t(`filling in for ${shopkeeper.fillingInFor}`)}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              {t(shopBlurb)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-background shadow-sm">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold tabular-nums">{coins}</span>
          </div>
        </div>
      </header>

      {flash && (
        <div
          className={`mt-3 rounded-2xl px-4 py-2.5 text-sm font-semibold ${
            flash.kind === "ok"
              ? "bg-primary/15 text-primary"
              : "bg-destructive/15 text-destructive"
          }`}
          role="status"
        >
          {flash.msg}
        </div>
      )}

      {/* Tabs */}
      <nav className="mt-5 -mx-5 overflow-x-auto px-5">
        <ul className="flex gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            const giver = t.id !== "all" && t.id !== "basic" ? getGiverById(t.id) : null;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {giver ? giver.name.split(" ")[0] : t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Catalog */}
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {items.map((item) => {
          const owned = ownedItems.includes(item.id);
          const isEquipped = equipped.has(item.id);
          const canAfford = coins >= item.price;
          const isBusy = busy === item.id;
          const giver = item.set !== "basic" ? getGiverById(item.set) : null;
          const giverDisplay = giver
            ? getDisplayGiver(giver.id, { halloweenActive, winterActive })
            : null;

          return (
            <li key={item.id} className="parchment-card relative flex flex-col p-3">
              {giver && giverDisplay && (
                <span
                  className="absolute right-2 top-2 text-base"
                  aria-label={`From ${giverDisplay.name}'s set`}
                  title={`${giverDisplay.name}'s set`}
                >
                  {giverDisplay.avatar}
                </span>
              )}
              <div
                className="grid aspect-square place-items-center rounded-xl text-5xl"
                style={{
                  background: item.color
                    ? `color-mix(in oklab, ${item.color} 30%, var(--card))`
                    : "var(--muted)",
                }}
              >
                {item.emoji}
              </div>
              <p className="mt-2 text-sm font-bold leading-tight text-foreground line-clamp-1">
                {t(item.name)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.slot}
              </p>

              {owned ? (
                <div className="mt-2 space-y-1.5">
                  <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/15 px-2 py-1.5 text-xs font-bold text-primary">
                    <ShoppingBag className="h-3 w-3" />
                    {t("Bought")}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEquip(item)}
                    disabled={isBusy}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold transition-colors ${
                      isEquipped
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground hover:bg-muted/70"
                    } disabled:opacity-50`}
                  >
                    {isEquipped ? (
                      <>
                        <Check className="h-3 w-3" />
                        {t("Wearing")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        {t("Wear it")}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBuy(item)}
                  disabled={!canAfford || isBusy}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-2 py-1.5 text-xs font-bold text-background transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {canAfford ? (
                    <>
                      <Coins className="h-3 w-3 text-accent" />
                      {item.price}
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      {item.price}
                    </>
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("Earn coins by saving sketches in your journal. 🌿")}
      </p>
    </div>
  );
}
