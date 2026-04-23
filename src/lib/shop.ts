export type ShopSlot = "hat" | "top" | "bottom" | "shoes" | "accessory";

export type ShopItem = {
  id: string;
  name: string;
  slot: ShopSlot;
  price: number;
  emoji: string;        // small icon for the catalog tile
  /**
   * Color used when rendering this piece on the paper-doll. Optional —
   * accessory/hat pieces sometimes render as emoji overlays instead.
   */
  color?: string;
  /** When set, the doll renders this emoji in the slot instead of a shape. */
  overlayEmoji?: string;
  /** Themed-set tag: which quest-giver this belongs to (or "basic"). */
  set: "basic" | "willow" | "professor-hoot" | "pip" | "mossback" | "clover";
  description: string;
};

/** All items the shop can sell. The id is what gets stored in dressup. */
export const SHOP_ITEMS: ShopItem[] = [
  // -- BASICS ---------------------------------------------------------------
  { id: "basic-tee-moss",   name: "Moss Tee",       slot: "top",      price: 30,  emoji: "👕", color: "#5b8a3a", set: "basic", description: "A soft cotton tee the color of fresh moss." },
  { id: "basic-tee-bloom",  name: "Bloom Tee",      slot: "top",      price: 30,  emoji: "👕", color: "#d97a8a", set: "basic", description: "A warm pink tee for sunny mornings." },
  { id: "basic-jacket",     name: "Field Jacket",   slot: "top",      price: 80,  emoji: "🧥", color: "#7a6240", set: "basic", description: "Lots of pockets for pebbles and feathers." },
  { id: "basic-jeans",      name: "Walking Jeans",  slot: "bottom",   price: 40,  emoji: "👖", color: "#3a4f78", set: "basic", description: "Tough denim that survives bramble paths." },
  { id: "basic-shorts",     name: "Meadow Shorts",  slot: "bottom",   price: 30,  emoji: "🩳", color: "#a3884f", set: "basic", description: "Breezy shorts for warm wandering." },
  { id: "basic-boots",      name: "Hiking Boots",   slot: "shoes",    price: 60,  emoji: "🥾", color: "#5b3a1f", set: "basic", description: "Broken-in boots, ready for any trail." },
  { id: "basic-sneakers",   name: "Soft Sneakers",  slot: "shoes",    price: 40,  emoji: "👟", color: "#dcdcdc", set: "basic", description: "For a gentler kind of expedition." },
  { id: "basic-cap",        name: "Canvas Cap",     slot: "hat",      price: 25,  emoji: "🧢", color: "#5b6b3a", set: "basic", description: "Keeps the sun off your sketches." },
  { id: "basic-scarf",      name: "Cozy Scarf",     slot: "accessory", price: 20, emoji: "🧣", overlayEmoji: "🧣", set: "basic", description: "For brisk dawn walks." },
  { id: "basic-glasses",    name: "Round Glasses",  slot: "accessory", price: 35, emoji: "👓", overlayEmoji: "👓", set: "basic", description: "Spot the smallest insects." },

  // -- WILLOW (witch) -------------------------------------------------------
  { id: "willow-hat",       name: "Hedge Witch Hat", slot: "hat",     price: 120, emoji: "🎩", overlayEmoji: "🧙‍♀️", set: "willow", description: "Pointed and patched, smelling faintly of thyme." },
  { id: "willow-cloak",     name: "Herbwitch Cloak", slot: "top",     price: 150, emoji: "🥼", color: "#3a2a4f", set: "willow", description: "Deep purple with a hidden pocket of dried lavender." },

  // -- PROFESSOR HOOT (owl) -------------------------------------------------
  { id: "hoot-cloak",       name: "Feather Cloak",   slot: "top",     price: 150, emoji: "🪶", color: "#6b5a3a", set: "professor-hoot", description: "Lined with soft owl-down. Whispers when you turn." },
  { id: "hoot-glasses",     name: "Sage Spectacles", slot: "accessory", price: 80, emoji: "👓", overlayEmoji: "🤓", set: "professor-hoot", description: "Lets you read riddles in tree bark." },

  // -- PIP (fox) ------------------------------------------------------------
  { id: "pip-scarf",        name: "Fox-Tail Scarf",  slot: "accessory", price: 90, emoji: "🦊", overlayEmoji: "🦊", set: "pip", description: "Bushy and bright. Pip insists it's not from his tail." },
  { id: "pip-sneakers",     name: "Scout Sneakers",  slot: "shoes",   price: 100, emoji: "👟", color: "#c25a2a", set: "pip", description: "Light enough to keep up with Pip. Almost." },

  // -- MOSSBACK (toad) ------------------------------------------------------
  { id: "mossback-hat",     name: "Lily-Pad Hat",    slot: "hat",     price: 110, emoji: "🍃", overlayEmoji: "🪷", set: "mossback", description: "A wide green disc that Mossback definitely didn't sit on first." },
  { id: "mossback-boots",   name: "Pond Wellies",    slot: "shoes",   price: 90,  emoji: "🥾", color: "#3a5a3a", set: "mossback", description: "Splash through any puddle, dignified." },

  // -- CLOVER (bunny) -------------------------------------------------------
  { id: "clover-flower",    name: "Daisy Crown",     slot: "hat",     price: 70,  emoji: "🌼", overlayEmoji: "🌼", set: "clover", description: "Woven by Clover at sunrise. Smells like meadow." },
  { id: "clover-dress",     name: "Sunshine Smock",  slot: "top",     price: 110, emoji: "👗", color: "#e0c75a", set: "clover", description: "The color of a four-leaf-clover wish." },
];

export function getItemById(id: string | null | undefined): ShopItem | undefined {
  if (!id) return undefined;
  return SHOP_ITEMS.find((i) => i.id === id);
}

export const COINS_PER_ENTRY = 15;
