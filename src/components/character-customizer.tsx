import { useState } from "react";
import { Coins, Lock, Check } from "lucide-react";
import {
  useCharacter,
  type Dressup,
  type FaceShape,
  type BodyShape,
  type HairStyleId,
  type EyebrowStyle,
  type FacialHairStyle,
  type BangStyle,
  DEFAULT_DRESSUP,
} from "@/hooks/use-character";
import { SHOP_ITEMS, type ShopSlot, type ShopItem } from "@/lib/shop";
import { DressupAvatar } from "@/components/dressup-avatar";

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
const HAIR_COLORS = [
  "#1a1410",
  "#3b2a1a",
  "#7a5236",
  "#b88a4a",
  "#d9b56b",
  "#c95a3a",
  "#5a4a8a",
  "#a8a8b0",
  "#e8e8f0",
];
const FACE_SHAPES: { id: FaceShape; label: string }[] = [
  { id: "round", label: "Round" },
  { id: "oval", label: "Oval" },
  { id: "heart", label: "Soft heart" },
  { id: "diamond", label: "Diamond" },
  { id: "octagon", label: "Soft octagon" },
  { id: "long", label: "Long oval" },
];

const BODY_SHAPES: { id: BodyShape; label: string }[] = [
  { id: "slim", label: "Slim" },
  { id: "average", label: "Average" },
  { id: "stocky", label: "Stocky" },
];

const FREE_HAIRSTYLES: { id: HairStyleId; label: string }[] = [
  { id: "soft-bob", label: "Soft bob" },
  { id: "long-bangs", label: "Long bangs" },
  { id: "curtain-cut", label: "Curtain cut" },
  { id: "low-pigtails", label: "Low pigtails" },
  { id: "long-pigtails", label: "Long pigtails" },
  { id: "space-buns", label: "Space buns" },
  { id: "fluffy-curls", label: "Fluffy curls" },
  { id: "twin-braids", label: "Twin braids" },
  { id: "side-sweep", label: "Side sweep" },
  { id: "afro", label: "Afro" },
  { id: "dreads", label: "Dreads" },
  { id: "topknot", label: "Topknot bun" },
  { id: "high-pony", label: "High ponytail" },
  { id: "side-pony", label: "Side ponytail" },
  { id: "fade", label: "Pixie cut" },
  { id: "bald", label: "No hair" },
];

const PREMIUM_HAIRSTYLES: { id: HairStyleId; label: string; price: number }[] = [];

const EYEBROW_STYLES: { id: EyebrowStyle; label: string }[] = [
  { id: "none", label: "None" },
  { id: "soft-arch", label: "Soft arch" },
  { id: "straight", label: "Straight" },
  { id: "thick", label: "Thick" },
  { id: "thin", label: "Thin" },
  { id: "raised", label: "Raised" },
];

const FACIAL_HAIR_STYLES: { id: FacialHairStyle; label: string }[] = [
  { id: "none", label: "Clean" },
  { id: "stubble", label: "Stubble" },
  { id: "mustache", label: "Mustache" },
  { id: "goatee", label: "Goatee" },
  { id: "full-beard", label: "Full beard" },
];

const BANG_STYLES: { id: BangStyle; label: string }[] = [
  { id: "default", label: "Style default" },
  { id: "none", label: "No bangs" },
  { id: "soft", label: "Soft" },
  { id: "side-swept", label: "Side-swept" },
  { id: "wispy", label: "Wispy" },
  { id: "curtain", label: "Curtain" },
  { id: "anime", label: "Anime chunks" },
  { id: "blunt", label: "Blunt" },
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
    return updateAppearance(patch as Partial<Dressup>);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="parchment-card mx-2 mb-2 flex w-full max-w-[460px] max-h-[94dvh] flex-col overflow-hidden p-0 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Customize
            </p>
            <h2 className="text-base font-bold text-foreground">Style your explorer</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">
              <Coins className="h-3 w-3 text-accent" />
              <span className="tabular-nums">{coins}</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              ✕
            </button>
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
          <div className="border-b border-border bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
            {flash}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3">
          {tab === "skin" && (
            <Section title="Skin tone">
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((c) => (
                  <Swatch
                    key={c}
                    color={c}
                    active={dressup.skin === c}
                    onClick={() => setField({ skin: c })}
                  />
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
              <SubTitle>Head size</SubTitle>
              <div className="rounded-lg border border-border bg-card px-3 py-3">
                <input
                  type="range"
                  min="86"
                  max="112"
                  step="1"
                  value={Math.round((dressup.headSize ?? 1) * 100)}
                  onChange={(event) =>
                    setField({ headSize: Number(event.currentTarget.value) / 100 })
                  }
                  className="w-full accent-current"
                  aria-label="Head size"
                />
                <div className="mt-1 flex justify-between text-[10px] font-semibold text-muted-foreground">
                  <span>Smaller</span>
                  <span>{Math.round((dressup.headSize ?? 1) * 100)}%</span>
                  <span>Bigger</span>
                </div>
              </div>
            </Section>
          )}

          {tab === "hair" && (
            <>
              <Section title="Hair color">
                <div className="flex flex-wrap gap-2">
                  {HAIR_COLORS.map((c) => (
                    <Swatch
                      key={c}
                      color={c}
                      active={dressup.hair === c}
                      onClick={() => setField({ hair: c })}
                    />
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
                      preview={
                        <MiniAvatar
                          dressup={{ ...dressup, hairstyle: h.id as Dressup["hairstyle"] }}
                        />
                      }
                    />
                  ))}
                </div>
                {PREMIUM_HAIRSTYLES.length > 0 && (
                  <>
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
                            onClick={() =>
                              buyAndApply(itemId, h.price, () =>
                                setField({ hairstyle: h.id as Dressup["hairstyle"] }),
                              )
                            }
                            preview={
                              <MiniAvatar
                                dressup={{ ...dressup, hairstyle: h.id as Dressup["hairstyle"] }}
                              />
                            }
                            badge={
                              owned ? (
                                active ? (
                                  <Check className="h-3 w-3" />
                                ) : null
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent">
                                  <Lock className="h-2.5 w-2.5" />
                                  {h.price}
                                </span>
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </Section>
              <Section title="Bangs">
                <div className="mb-2 text-[11px] text-muted-foreground">
                  Mix any bangs with any hairstyle.
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {BANG_STYLES.map((b) => (
                    <PreviewTile
                      key={b.id}
                      label={b.label}
                      active={(dressup.bangs ?? "default") === b.id}
                      onClick={() => setField({ bangs: b.id })}
                      preview={<MiniAvatar dressup={{ ...dressup, bangs: b.id }} />}
                    />
                  ))}
                </div>
              </Section>
              <Section title="Eyebrows">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Current: {EYEBROW_STYLES.find((b) => b.id === (dressup.eyebrows ?? "none"))?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setField({ eyebrows: "none" })}
                    disabled={(dressup.eyebrows ?? "none") === "none"}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {EYEBROW_STYLES.map((b) => (
                    <PreviewTile
                      key={b.id}
                      label={b.label}
                      active={(dressup.eyebrows ?? "none") === b.id}
                      onClick={() => setField({ eyebrows: b.id })}
                      preview={<MiniAvatar dressup={{ ...dressup, eyebrows: b.id }} />}
                    />
                  ))}
                </div>
              </Section>
              <Section title="Facial hair">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Current: {FACIAL_HAIR_STYLES.find((f) => f.id === (dressup.facialHair ?? "none"))?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setField({ facialHair: "none" })}
                    disabled={(dressup.facialHair ?? "none") === "none"}
                    className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    Reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FACIAL_HAIR_STYLES.map((f) => (
                    <PreviewTile
                      key={f.id}
                      label={f.label}
                      active={(dressup.facialHair ?? "none") === f.id}
                      onClick={() => setField({ facialHair: f.id })}
                      preview={<MiniAvatar dressup={{ ...dressup, facialHair: f.id }} />}
                    />
                  ))}
                </div>
              </Section>
            </>
          )}

          {tab === "accessories" && (
            <>
              <SlotPicker
                label="Earrings"
                slot="earrings"
                current={dressup.earrings}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Necklace"
                slot="necklace"
                current={dressup.necklace}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Bracelet"
                slot="bracelet"
                current={dressup.bracelet}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Hair clip"
                slot="hairClip"
                current={dressup.hairClip}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Glasses & more"
                slot="accessory"
                current={dressup.accessory}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
            </>
          )}

          {tab === "clothing" && (
            <>
              <SlotPicker
                label="Tops"
                slot="top"
                current={dressup.top}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Bottoms"
                slot="bottom"
                current={dressup.bottom}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Dresses"
                slot="dress"
                current={dressup.dress}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Shoes"
                slot="shoes"
                current={dressup.shoes}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Hats"
                slot="hat"
                current={dressup.hat}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
            </>
          )}

          {tab === "extras" && (
            <>
              <SlotPicker
                label="Ear piercings"
                slot="earPiercing"
                current={dressup.earPiercing}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Face piercings"
                slot="facePiercing"
                current={dressup.facePiercing}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
              <SlotPicker
                label="Hearing aids & headphones"
                slot="ears"
                current={dressup.ears}
                dressup={dressup}
                {...{ ownedSet, busy, equipItem, buyAndApply }}
              />
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
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h4>
  );
}
function Swatch({
  color,
  active,
  onClick,
  bare = false,
}: {
  color: string;
  active?: boolean;
  onClick: () => void;
  bare?: boolean;
}) {
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
        active
          ? "border-foreground bg-primary/15 ring-1 ring-primary"
          : "border-border bg-card hover:bg-muted"
      }`}
    >
      <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-muted/50">
        {preview}
      </div>
      <span className="line-clamp-1 text-foreground">{label}</span>
      {badge && (
        <span className="absolute right-1 top-1 rounded-full bg-background/80 px-1 py-0.5">
          {badge}
        </span>
      )}
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
  const c = item.color ?? "currentColor";
  const dark = "color-mix(in oklab, currentColor 70%, var(--background))";
  const skin = "#f1c9a5";

  if (["earrings", "earPiercing", "ears"].includes(item.slot)) {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full text-foreground" aria-hidden>
        <ellipse
          cx="25"
          cy="36"
          rx="10"
          ry="16"
          fill={skin}
          stroke="currentColor"
          strokeOpacity="0.18"
        />
        <ellipse
          cx="47"
          cy="36"
          rx="10"
          ry="16"
          fill={skin}
          stroke="currentColor"
          strokeOpacity="0.18"
        />
        <ellipse cx="25" cy="37" rx="4" ry="8" fill="rgba(255,255,255,.22)" />
        <ellipse cx="47" cy="37" rx="4" ry="8" fill="rgba(255,255,255,.22)" />
        {item.slot === "ears" && item.id.includes("headphones") ? (
          <>
            <path d="M 25 24 Q 36 12 47 24" stroke={c} strokeWidth="5" fill="none" />
            <ellipse cx="25" cy="38" rx="8" ry="10" fill={c} />
            <ellipse cx="47" cy="38" rx="8" ry="10" fill={c} />
          </>
        ) : item.slot === "ears" && item.id.includes("pods") ? (
          <>
            <rect x="23" y="36" width="4" height="11" rx="2" fill={c} />
            <rect x="45" y="36" width="4" height="11" rx="2" fill={c} />
          </>
        ) : item.slot === "ears" ? (
          <>
            <path d="M 21 28 q -7 5 0 12" stroke={c} strokeWidth="3" fill="none" />
            <path d="M 51 28 q 7 5 0 12" stroke={c} strokeWidth="3" fill="none" />
          </>
        ) : item.id.includes("hoops") || item.id.includes("cuff") ? (
          <>
            <circle cx="25" cy="50" r="5" fill="none" stroke={c} strokeWidth="2.5" />
            <circle cx="47" cy="50" r="5" fill="none" stroke={c} strokeWidth="2.5" />
          </>
        ) : (
          <>
            <circle cx="25" cy="49" r="3.2" fill={c} />
            <circle cx="47" cy="49" r="3.2" fill={c} />
          </>
        )}
      </svg>
    );
  }

  if (item.slot === "facePiercing") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full text-foreground" aria-hidden>
        <circle cx="36" cy="36" r="23" fill={skin} stroke="currentColor" strokeOpacity="0.16" />
        <ellipse cx="28" cy="35" rx="3" ry="4" fill="currentColor" />
        <ellipse cx="44" cy="35" rx="3" ry="4" fill="currentColor" />
        <path
          d="M 33 47 Q 36 50 39 47"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {item.id.includes("nose") ? (
          <circle cx="40" cy="42" r="2.4" fill={c} />
        ) : item.id.includes("eyebrow") ? (
          <rect x="24" y="28" width="8" height="2.4" rx="1" fill={c} />
        ) : (
          <circle cx="31" cy="49" r="2.6" fill="none" stroke={c} strokeWidth="2" />
        )}
      </svg>
    );
  }

  if (item.slot === "necklace") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
        <path
          d="M 20 24 Q 36 52 52 24"
          stroke={c}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M 36 44 L 42 50 L 36 57 L 30 50 Z" fill={c} />
      </svg>
    );
  }
  if (item.slot === "bracelet") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
        <ellipse cx="36" cy="36" rx="19" ry="12" fill="none" stroke={c} strokeWidth="5" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={24 + i * 8} cy={29 + (i % 2) * 14} r="3" fill={dark} />
        ))}
      </svg>
    );
  }
  if (item.slot === "hairClip") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
        <path d="M 36 36 L 18 25 Q 10 36 18 47 Z" fill={c} />
        <path d="M 36 36 L 54 25 Q 62 36 54 47 Z" fill={c} />
        <circle cx="36" cy="36" r="6" fill={dark} />
      </svg>
    );
  }
  if (item.slot === "hat") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
        <ellipse cx="36" cy="45" rx="27" ry="6" fill={c} />
        <path d="M 21 45 Q 36 16 51 45 Z" fill={c} opacity="0.9" />
      </svg>
    );
  }
  if (item.slot === "accessory") {
    return (
      <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
        <circle cx="28" cy="33" r="9" fill="none" stroke={c} strokeWidth="4" />
        <circle cx="48" cy="33" r="9" fill="none" stroke={c} strokeWidth="4" />
        <path d="M 37 33 L 39 33" stroke={c} strokeWidth="4" />
        <path
          d="M 25 48 Q 36 56 47 48"
          stroke={c}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div className="grid h-full w-full place-items-center">
      <span className="h-8 w-8 rounded-full border-4 border-current" style={{ color: c }} />
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
            useAvatarPreview ? (
              <MiniAvatar dressup={dressupWithItem(dressup, slot, null)} />
            ) : (
              <div className="grid h-full w-full place-items-center text-2xl text-muted-foreground">
                ∅
              </div>
            )
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
                useAvatarPreview ? (
                  <MiniAvatar dressup={dressupWithItem(dressup, slot, item.id)} />
                ) : (
                  <IsolatedItemIcon item={item} />
                )
              }
              badge={
                !owned && !free ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent">
                    <Lock className="h-2.5 w-2.5" />
                    {item.price}
                  </span>
                ) : active ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : null
              }
            />
          );
        })}
      </div>
    </Section>
  );
}
