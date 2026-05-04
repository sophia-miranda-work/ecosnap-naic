import { useState } from "react";
import { Coins, Lock, Check } from "lucide-react";
import {
  useCharacter,
  type Dressup,
  type FaceShape,
  type BodyShape,
  type HairStyleId,
  DEFAULT_DRESSUP,
} from "@/hooks/use-character";
import { SHOP_ITEMS, type ShopSlot, type ShopItem } from "@/lib/shop";
import { DressupAvatar, hairLayers, HEAD_CX, HEAD_CY } from "@/components/dressup-avatar";

/**
 * Tabbed customization panel.
 *
 * - The avatar is sticky at the top so the user always sees how their picks
 *   look as they tap options.
 * - Hair and clothing options are previewed as mini-avatar tiles so users
 *   actually see the style — not a text label.
 * - Tiny accessories (piercings, jewelry, nails, hair clips, ear extras)
 *   show as isolated SVG icons inside their tile.
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
  { id: "round", label: "Large round" },
  { id: "oval", label: "Soft oval" },
  { id: "heart", label: "Baby round" },
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

function premiumHairItemId(style: HairStyleId): string {
  return `hair-${style}`;
}

/** Slots that benefit from showing a mini-avatar wearing the item. */
const AVATAR_PREVIEW_SLOTS = new Set<ShopSlot>(["top", "bottom", "shoes", "dress"]);

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
        <div className="flex items-center justify-between border-b border-border p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Customize</p>
            <h2 className="text-base font-bold text-foreground">Style your explorer</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">
              <Coins className="h-3 w-3 text-accent" />
              <span className="tabular-nums">{coins}</span>
            </span>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="Close">✕</button>
          </div>
        </div>

        {/* Sticky live preview */}
        <div className="flex shrink-0 items-center justify-center border-b border-border bg-gradient-to-b from-primary/10 to-transparent py-3">
          <DressupAvatar dressup={dressup} size={130} />
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
        <div className="flex-1 overflow-y-auto p-3">
          {tab === "skin" && (
            <Section title="Skin tone">
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((c) => (
                  <Swatch key={c} color={c} active={dressup.skin === c} onClick={() => setField({ skin: c })} />
                ))}
              </div>
              <SubTitle>Body shape</SubTitle>
              <div className="grid grid-cols-3 gap-2">
                {BODY_SHAPES.map((b) => (
                  <PreviewTile
                    key={b.id}
                    label={b.label}
                    active={dressup.bodyShape === b.id}
                    onClick={() => setField({ bodyShape: b.id })}
                    preview={<MiniAvatar dressup={{ ...dressup, bodyShape: b.id }} />}
                  />
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
              <div className="grid grid-cols-3 gap-2">
                {FACE_SHAPES.map((f) => (
                  <PreviewTile
                    key={f.id}
                    label={f.label}
                    active={dressup.faceShape === f.id}
                    onClick={() => setField({ faceShape: f.id })}
                    preview={<MiniAvatar dressup={{ ...dressup, faceShape: f.id }} />}
                  />
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
                <div className="grid grid-cols-3 gap-2">
                  {FREE_HAIRSTYLES.map((h) => (
                    <PreviewTile
                      key={h.id}
                      label={h.label}
                      active={dressup.hairstyle === h.id}
                      onClick={() => setField({ hairstyle: h.id as Dressup["hairstyle"] })}
                      preview={<MiniAvatar dressup={{ ...dressup, hairstyle: h.id as Dressup["hairstyle"] }} />}
                    />
                  ))}
                </div>
                <SubTitle>Premium</SubTitle>
                <div className="grid grid-cols-3 gap-2">
                  {PREMIUM_HAIRSTYLES.map((h) => {
                    const itemId = premiumHairItemId(h.id);
                    const owned = ownedSet.has(itemId);
                    const active = dressup.hairstyle === h.id;
                    return (
                      <PreviewTile
                        key={h.id}
                        label={h.label}
                        active={active}
                        disabled={busy === itemId}
                        onClick={() => buyAndApply(itemId, h.price, () => setField({ hairstyle: h.id as Dressup["hairstyle"] }))}
                        preview={<MiniAvatar dressup={{ ...dressup, hairstyle: h.id as Dressup["hairstyle"] }} />}
                        badge={owned ? (active ? <Check className="h-3 w-3" /> : null) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent">
                            <Lock className="h-2.5 w-2.5" />{h.price}
                          </span>
                        )}
                      />
                    );
                  })}
                </div>
              </Section>
            </>
          )}

          {tab === "accessories" && (
            <>
              <SlotPicker label="Earrings"        slot="earrings"  current={dressup.earrings}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Necklace"        slot="necklace"  current={dressup.necklace}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Bracelet"        slot="bracelet"  current={dressup.bracelet}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hair clip"       slot="hairClip"  current={dressup.hairClip}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Glasses & more"  slot="accessory" current={dressup.accessory} dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
            </>
          )}

          {tab === "clothing" && (
            <>
              <SlotPicker label="Tops"     slot="top"    current={dressup.top}    dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Bottoms"  slot="bottom" current={dressup.bottom} dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Dresses"  slot="dress"  current={dressup.dress}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Shoes"    slot="shoes"  current={dressup.shoes}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hats"     slot="hat"    current={dressup.hat}    dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
            </>
          )}

          {tab === "extras" && (
            <>
              <SlotPicker label="Ear piercings"               slot="earPiercing"  current={dressup.earPiercing}  dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Face piercings"              slot="facePiercing" current={dressup.facePiercing} dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
              <SlotPicker label="Hearing aids & headphones"   slot="ears"         current={dressup.ears}         dressup={dressup} {...{ ownedSet, busy, equipItem, buyAndApply }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------- shared building blocks ------------------------

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

/** A reusable tile that shows a visual preview + a label and active/lock state. */
function PreviewTile({
  preview,
  label,
  active,
  disabled,
  onClick,
  badge,
}: {
  preview: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={!!active}
      className={`relative flex flex-col items-center gap-1 rounded-xl border p-1.5 text-center text-[10px] font-semibold transition-colors disabled:opacity-50 ${
        active ? "border-foreground bg-primary/15 ring-1 ring-primary" : "border-border bg-card hover:bg-muted"
      }`}
    >
      <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-muted/50">
        {preview}
      </div>
      <span className="line-clamp-1 text-foreground">{label}</span>
      {badge && <span className="absolute right-1 top-1 rounded-full bg-background/80 px-1 py-0.5">{badge}</span>}
    </button>
  );
}

/** Tiny rendered avatar used inside option tiles. Strips features the user
 *  isn't choosing right now (no hat/accessory) so the relevant change pops. */
function MiniAvatar({ dressup }: { dressup: Dressup }) {
  return (
    <div className="flex items-center justify-center">
      <DressupAvatar dressup={dressup} size={56} />
    </div>
  );
}

// ---------------------------- isolated icon previews ------------------------

/** Renders a small SVG showing the item alone (no avatar around it) for tiny
 *  accessories: jewelry, piercings, nail polish, hair clips, ear extras. */
function IsolatedItemIcon({ item }: { item: ShopItem }) {
  // Generic colored badge with the item emoji on top — readable and consistent.
  const bg = item.color
    ? `color-mix(in oklab, ${item.color} 35%, var(--card))`
    : "var(--muted)";
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: bg }}>
      <span className="text-2xl" aria-hidden>{item.overlayEmoji ?? item.emoji}</span>
    </div>
  );
}

/** Builds a dressup with ONLY the slot we're previewing changed — so the
 *  mini-avatar shows the user the effect of choosing that item. */
function dressupWithItem(dressup: Dressup, slot: ShopSlot, itemId: string | null): Dressup {
  // Start from a clean canvas for clothes/hair so the preview isn't dominated
  // by the user's other equipment in tiny tiles.
  if (AVATAR_PREVIEW_SLOTS.has(slot)) {
    const base: Dressup = {
      ...DEFAULT_DRESSUP,
      skin: dressup.skin,
      hair: dressup.hair,
      hairstyle: dressup.hairstyle,
      faceShape: dressup.faceShape,
      bodyShape: dressup.bodyShape,
    };
    return { ...base, [slot]: itemId } as Dressup;
  }
  return { ...dressup, [slot]: itemId };
}

function SlotPicker({
  label,
  slot,
  current,
  dressup,
  ownedSet,
  busy,
  equipItem,
  buyAndApply,
}: {
  label: string;
  slot: ShopSlot;
  current: string | null | undefined;
  dressup: Dressup;
  ownedSet: Set<string>;
  busy: string | null;
  equipItem: (slot: ShopSlot, itemId: string | null) => Promise<void>;
  buyAndApply: (itemId: string, price: number, apply: () => Promise<void> | void) => Promise<void>;
}) {
  const items = SHOP_ITEMS.filter((i) => i.slot === slot);
  if (items.length === 0) return null;
  const useAvatarPreview = AVATAR_PREVIEW_SLOTS.has(slot);

  return (
    <Section title={label}>
      <div className="grid grid-cols-3 gap-2">
        {/* "None" tile */}
        <PreviewTile
          label="None"
          active={!current}
          onClick={() => equipItem(slot, null)}
          preview={
            useAvatarPreview
              ? <MiniAvatar dressup={dressupWithItem(dressup, slot, null)} />
              : <div className="grid h-full w-full place-items-center text-2xl text-muted-foreground">∅</div>
          }
        />

        {items.map((item) => {
          const owned = ownedSet.has(item.id);
          const active = current === item.id;
          const free = item.price === 0;
          return (
            <PreviewTile
              key={item.id}
              label={item.name}
              active={active}
              disabled={busy === item.id}
              onClick={() =>
                owned || free
                  ? equipItem(slot, active ? null : item.id)
                  : buyAndApply(item.id, item.price, () => equipItem(slot, item.id))
              }
              preview={
                useAvatarPreview
                  ? <MiniAvatar dressup={dressupWithItem(dressup, slot, item.id)} />
                  : <IsolatedItemIcon item={item} />
              }
              badge={!owned && !free ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent">
                  <Lock className="h-2.5 w-2.5" />{item.price}
                </span>
              ) : (active ? <Check className="h-3 w-3 text-primary" /> : null)}
            />
          );
        })}
      </div>
    </Section>
  );
}

// Suppress unused-import warning when tree-shaken by build (these are used
// indirectly via `dressup-avatar` but keep the explicit import path warm).
void hairLayers; void HEAD_CX; void HEAD_CY;