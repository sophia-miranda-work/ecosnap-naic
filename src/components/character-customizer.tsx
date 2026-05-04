import { useState } from "react";
import { Coins, Lock, Check } from "lucide-react";
import {
  useCharacter,
  type Dressup,
  type FaceShape,
  type BodyShape,
  type HairStyleId,
} from "@/hooks/use-character";
import { SHOP_ITEMS, type ShopSlot } from "@/lib/shop";

/**
 * Tabbed customization panel. Free options (skin, hair color, basic
 * hairstyles, face & body shape) live alongside premium owned items in their
 * relevant tab. Premium items the user does not own show a coin price and
 * deep-link to the shop.
 */

type TabId = "skin" | "face" | "hair" | "accessories" | "clothing" | "extras";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "skin", label: "Skin", emoji: "🎨" },
  { id: "face", label: "Face", emoji: "🙂" },
  { id: "hair", label: "Hair", emoji: "💇" },
  { id: "accessories", label: "Accessories", emoji: "💍" },
  { id: "clothing", label: "Clothing", emoji: "👗" },
  { id: "extras", label: "Extras", emoji: "✨" },
];

const SKIN_TONES = ["#f7d9bd", "#f1c9a5", "#d9a87a", "#a87651", "#7a5236", "#4a3220", "#2e1c10"];
const HAIR_COLORS = ["#1a1410", "#3b2a1a", "#7a5236", "#b88a4a", "#d9b56b", "#c95a3a", "#5a4a8a", "#a8a8b0", "#e8e8f0"];
const NAIL_COLORS = [null, "#e83a5a", "#f0a8c0", "#a83af0", "#3a8af0", "#3af0a8", "#f0e83a", "#1a1410"];

const FACE_SHAPES: { id: FaceShape; label: string }[] = [
  { id: "round",   label: "Round" },
  { id: "oval",    label: "Oval" },
  { id: "square",  label: "Square" },
  { id: "heart",   label: "Heart" },
  { id: "diamond", label: "Diamond" },
];

const BODY_SHAPES: { id: BodyShape; label: string }[] = [
  { id: "slim",    label: "Slim" },
  { id: "average", label: "Average" },
  { id: "stocky",  label: "Stocky" },
];

const FREE_HAIRSTYLES: { id: HairStyleId; label: string }[] = [
  { id: "bald",        label: "Bald" },
  { id: "short",       label: "Short" },
  { id: "long",        label: "Long" },
  { id: "curly",       label: "Curly" },
  { id: "wavy",        label: "Wavy" },
  { id: "bob",         label: "Bob" },
  { id: "fade",        label: "Fade" },
  { id: "ponytail",    label: "Ponytail" },
  { id: "pigtails",    label: "Pigtails" },
  { id: "bun",         label: "Bun" },
];

const PREMIUM_HAIRSTYLES: { id: HairStyleId; label: string; price: number }[] = [
  { id: "afro",        label: "Afro",       price: 150 },
  { id: "side-bun",    label: "Side Bun",   price: 130 },
  { id: "double-bun",  label: "Double Bun", price: 140 },
  { id: "braids",      label: "Braids",     price: 180 },
  { id: "topknot",     label: "Top Knot",   price: 120 },
  { id: "mohawk",      label: "Mohawk",     price: 200 },
  { id: "undercut",    label: "Undercut",   price: 160 },
];

/** Premium hairstyles are owned via character_items just like clothing — id stored as `hair-<style>`. */
function premiumHairItemId(style: HairStyleId): string {
  return `hair-${style}`;
}

export function CharacterCustomizer({ onClose }: { onClose: () => void }) {
  const { character, ownedItems, updateAppearance, equipItem, purchase, refresh } = useCharacter();
  const [tab, setTab] = useState<TabId>("skin");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  if (!character) return null;
  const dressup = character.dressup;
  const coins = character.coins;
  const ownedSet = new Set(ownedItems);

  async function buyAndApply(itemId: string, price: number, apply: () => Promise<void> | void) {
    setBusy(itemId);
    setFlash(null);
    try {
      if (!ownedSet.has(itemId)) {
        if (coins < price) {
          setFlash("Not enough coins yet — earn more in your journal.");
          setTimeout(() => setFlash(null), 2200);
          return;
        }
        await purchase(itemId, price);
      }
      await apply();
      setFlash("Looking great!");
      setTimeout(() => setFlash(null), 1600);
      await refresh();
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "Couldn't apply that.");
      setTimeout(() => setFlash(null), 2400);
    } finally {
      setBusy(null);
    }
  }

  function setField<K extends keyof Dressup>(patch: Partial<Pick<Dressup, K>>) {
    return updateAppearance(patch as Partial<Pick<Dressup, "skin" | "hair" | "hairstyle">>);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="parchment-card mx-2 mb-2 flex w-full max-w-[460px] max-h-[94dvh] flex-col overflow-hidden p-0 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customize</p>
            <h2 className="text-lg font-bold text-foreground">Style your explorer</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">
              <Coins className="h-3 w-3 text-accent" />
              <span className="tabular-nums">{coins}</span>
            </span>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-muted/30 px-2 py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.id ? "bg-foreground text-background" : "text-foreground hover:bg-muted"
              }`}
            >
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {flash && (
          <div className="border-b border-border bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">{flash}</div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "skin" && (
            <Section title="Skin tone">
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((c) => (
                  <Swatch key={c} color={c} active={dressup.skin === c} onClick={() => setField({ skin: c })} />
                ))}
              </div>
              <SubTitle>Body shape</SubTitle>
              <div className="flex flex-wrap gap-2">
                {BODY_SHAPES.map((b) => (
                  <Chip key={b.id} active={dressup.bodyShape === b.id} onClick={() => setField({ bodyShape: b.id })}>{b.label}</Chip>
                ))}
              </div>
              <SubTitle>Nail polish</SubTitle>
              <div className="flex flex-wrap gap-2">
                {NAIL_COLORS.map((c, i) => (
                  <Swatch
                    key={i}
                    color={c ?? "transparent"}
                    bare={c === null}
                    active={dressup.nail === c}
                    onClick={() => setField({ nail: c })}
                  />
                ))}
              </div>
            </Section>
          )}

          {tab === "face" && (
            <Section title="Face shape">
              <div className="flex flex-wrap gap-2">
                {FACE_SHAPES.map((f) => (
                  <Chip key={f.id} active={dressup.faceShape === f.id} onClick={() => setField({ faceShape: f.id })}>{f.label}</Chip>
                ))}
              </div>
            </Section>
          )}

          {tab === "hair" && (
            <>
              <Section title="Hair color">
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((c) => (
                    <Swatch key={c} color={c} active={dressup.hair === c} onClick={() => setField({ hair: c })} />
                  ))}
                </div>
              </Section>
              <Section title="Hairstyles">
                <div className="flex flex-wrap gap-2">
                  {FREE_HAIRSTYLES.map((h) => (
                    <Chip key={h.id} active={dressup.hairstyle === h.id} onClick={() => setField({ hairstyle: h.id as Dressup["hairstyle"] })}>{h.label}</Chip>
                  ))}
                </div>
                <SubTitle>Premium</SubTitle>
                <div className="flex flex-wrap gap-2">
                  {PREMIUM_HAIRSTYLES.map((h) => {
                    const itemId = premiumHairItemId(h.id);
                    const owned = ownedSet.has(itemId);
                    const active = dressup.hairstyle === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        disabled={busy === itemId}
                        onClick={() => buyAndApply(itemId, h.price, () => setField({ hairstyle: h.id as Dressup["hairstyle"] }))}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                          active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {h.label}
                        {owned ? (active ? <Check className="h-3 w-3" /> : null) : (
                          <span className="inline-flex items-center gap-0.5 text-accent">
                            <Lock className="h-3 w-3" />
                            {h.price}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Section>
            </>
          )}

          {tab === "accessories" && (
            <>
              <SlotPicker label="Earrings" slot="earrings" current={dressup.earrings} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Necklace" slot="necklace" current={dressup.necklace} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Bracelet" slot="bracelet" current={dressup.bracelet} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hair clip" slot="hairClip" current={dressup.hairClip} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Glasses & more" slot="accessory" current={dressup.accessory} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
            </>
          )}

          {tab === "clothing" && (
            <>
              <SlotPicker label="Tops" slot="top" current={dressup.top} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Bottoms" slot="bottom" current={dressup.bottom} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Dresses" slot="dress" current={dressup.dress} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Shoes" slot="shoes" current={dressup.shoes} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hats" slot="hat" current={dressup.hat} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
            </>
          )}

          {tab === "extras" && (
            <>
              <SlotPicker label="Ear piercings" slot="earPiercing" current={dressup.earPiercing} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Face piercings" slot="facePiercing" current={dressup.facePiercing} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hearing aids & headphones" slot="ears" current={dressup.ears} {...{ ownedSet, coins, busy, equipItem, buyAndApply }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h4>;
}
function Swatch({ color, active, onClick, bare = false }: { color: string; active?: boolean; onClick: () => void; bare?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={`h-9 w-9 rounded-full border-2 transition-transform active:scale-90 ${active ? "border-foreground" : "border-transparent"} ${bare ? "bg-card" : ""}`}
      style={bare ? undefined : { backgroundColor: color }}
    >
      {bare ? <span className="text-[10px] font-bold text-muted-foreground">none</span> : null}
    </button>
  );
}
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

function SlotPicker({
  label,
  slot,
  current,
  ownedSet,
  coins,
  busy,
  equipItem,
  buyAndApply,
}: {
  label: string;
  slot: ShopSlot;
  current: string | null | undefined;
  ownedSet: Set<string>;
  coins: number;
  busy: string | null;
  equipItem: (slot: ShopSlot, itemId: string | null) => Promise<void>;
  buyAndApply: (itemId: string, price: number, apply: () => Promise<void> | void) => Promise<void>;
}) {
  const items = SHOP_ITEMS.filter((i) => i.slot === slot);
  if (items.length === 0) return null;
  return (
    <Section title={label}>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => equipItem(slot, null)}
          className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[10px] font-semibold ${
            !current ? "border-foreground bg-primary/15 ring-1 ring-primary" : "border-border bg-card hover:bg-muted"
          }`}
        >
          <span className="grid aspect-square w-full place-items-center rounded-lg bg-muted text-xl">∅</span>
          None
        </button>
        {items.map((item) => {
          const owned = ownedSet.has(item.id);
          const active = current === item.id;
          const free = item.price === 0;
          return (
            <button
              key={item.id}
              type="button"
              disabled={busy === item.id}
              onClick={() =>
                owned || free
                  ? equipItem(slot, active ? null : item.id)
                  : buyAndApply(item.id, item.price, () => equipItem(slot, item.id))
              }
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center text-[10px] font-semibold transition-colors disabled:opacity-50 ${
                active ? "border-foreground bg-primary/15 ring-1 ring-primary" : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span
                className="grid aspect-square w-full place-items-center rounded-lg text-2xl"
                style={{
                  background: item.color
                    ? `color-mix(in oklab, ${item.color} 30%, var(--card))`
                    : "var(--muted)",
                }}
                aria-hidden
              >
                {item.emoji}
              </span>
              <span className="line-clamp-1 text-foreground">{item.name}</span>
              {!owned && !free && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent">
                  <Lock className="h-2.5 w-2.5" />
                  {item.price}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Section>
  );
}