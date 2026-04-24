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
  { id: "basic-sweater",    name: "Knit Sweater",   slot: "top",      price: 70,  emoji: "🧶", color: "#b08a5a", set: "basic", description: "Hand-knit, slightly itchy in the best way." },
  { id: "basic-raincoat",   name: "Yellow Raincoat",slot: "top",      price: 90,  emoji: "🧥", color: "#e0b840", set: "basic", description: "Bright as a buttercup, dry as a bone." },
  { id: "basic-flannel",    name: "Flannel Shirt",  slot: "top",      price: 55,  emoji: "👔", color: "#a04848", set: "basic", description: "Red plaid. Smells faintly of woodsmoke." },
  { id: "basic-jeans",      name: "Walking Jeans",  slot: "bottom",   price: 40,  emoji: "👖", color: "#3a4f78", set: "basic", description: "Tough denim that survives bramble paths." },
  { id: "basic-shorts",     name: "Meadow Shorts",  slot: "bottom",   price: 30,  emoji: "🩳", color: "#a3884f", set: "basic", description: "Breezy shorts for warm wandering." },
  { id: "basic-cargo",      name: "Cargo Trousers", slot: "bottom",   price: 60,  emoji: "👖", color: "#5b6b3a", set: "basic", description: "Six pockets — one for each pebble." },
  { id: "basic-overalls",   name: "Garden Overalls",slot: "bottom",   price: 75,  emoji: "👖", color: "#3a5a78", set: "basic", description: "For digging, kneeling, and napping in." },
  { id: "basic-boots",      name: "Hiking Boots",   slot: "shoes",    price: 60,  emoji: "🥾", color: "#5b3a1f", set: "basic", description: "Broken-in boots, ready for any trail." },
  { id: "basic-sneakers",   name: "Soft Sneakers",  slot: "shoes",    price: 40,  emoji: "👟", color: "#dcdcdc", set: "basic", description: "For a gentler kind of expedition." },
  { id: "basic-sandals",    name: "Brook Sandals",  slot: "shoes",    price: 35,  emoji: "🩴", color: "#8a6240", set: "basic", description: "Wade through streams, dry in seconds." },
  { id: "basic-wellies",    name: "Rain Wellies",   slot: "shoes",    price: 55,  emoji: "🥾", color: "#3a6a78", set: "basic", description: "Puddle-ready, mud-proof." },
  { id: "basic-cap",        name: "Canvas Cap",     slot: "hat",      price: 25,  emoji: "🧢", color: "#5b6b3a", set: "basic", description: "Keeps the sun off your sketches." },
  { id: "basic-beanie",     name: "Wool Beanie",    slot: "hat",      price: 30,  emoji: "🧶", color: "#5b3a78", set: "basic", description: "For chilly dawn starts." },
  { id: "basic-sunhat",     name: "Straw Sunhat",   slot: "hat",      price: 45,  emoji: "👒", color: "#d8b87a", set: "basic", description: "Wide-brimmed and breezy." },
  { id: "basic-bandana",    name: "Trail Bandana",  slot: "hat",      price: 20,  emoji: "🧣", color: "#a04848", set: "basic", description: "Tied above the brow, like a proper scout." },
  { id: "basic-scarf",      name: "Cozy Scarf",     slot: "accessory", price: 20, emoji: "🧣", overlayEmoji: "🧣", set: "basic", description: "For brisk dawn walks." },
  { id: "basic-glasses",    name: "Round Glasses",  slot: "accessory", price: 35, emoji: "👓", overlayEmoji: "👓", set: "basic", description: "Spot the smallest insects." },
  { id: "basic-binoculars", name: "Pocket Binoculars", slot: "accessory", price: 60, emoji: "🔭", overlayEmoji: "🔭", set: "basic", description: "Bring distant birds politely closer." },
  { id: "basic-backpack",   name: "Canvas Backpack",slot: "accessory", price: 70, emoji: "🎒", overlayEmoji: "🎒", set: "basic", description: "Holds your notebook, snacks, and one small mystery." },
  { id: "basic-compass",    name: "Brass Compass",  slot: "accessory", price: 50, emoji: "🧭", overlayEmoji: "🧭", set: "basic", description: "Always points home — eventually." },

  // -- WILLOW (witch) -------------------------------------------------------
  { id: "willow-hat",       name: "Hedge Witch Hat", slot: "hat",     price: 120, emoji: "🎩", overlayEmoji: "🧙‍♀️", set: "willow", description: "Pointed and patched, smelling faintly of thyme." },
  { id: "willow-cloak",     name: "Herbwitch Cloak", slot: "top",     price: 150, emoji: "🥼", color: "#3a2a4f", set: "willow", description: "Deep purple with a hidden pocket of dried lavender." },
  { id: "willow-skirt",     name: "Bramble Skirt",   slot: "bottom",  price: 110, emoji: "👗", color: "#4f2a3a", set: "willow", description: "Long, dark, and patched with embroidered ferns." },
  { id: "willow-amulet",    name: "Moonstone Amulet",slot: "accessory", price: 130, emoji: "🌙", overlayEmoji: "🌙", set: "willow", description: "Glows faintly when you sketch under moonlight." },
  { id: "willow-boots",     name: "Witch's Boots",   slot: "shoes",   price: 120, emoji: "🥾", color: "#2a1f3a", set: "willow", description: "Buckled, weathered, perfect for hedge-hopping." },

  // -- PROFESSOR HOOT (owl) -------------------------------------------------
  { id: "hoot-cloak",       name: "Feather Cloak",   slot: "top",     price: 150, emoji: "🪶", color: "#6b5a3a", set: "professor-hoot", description: "Lined with soft owl-down. Whispers when you turn." },
  { id: "hoot-glasses",     name: "Sage Spectacles", slot: "accessory", price: 80, emoji: "👓", overlayEmoji: "🤓", set: "professor-hoot", description: "Lets you read riddles in tree bark." },
  { id: "hoot-cap",         name: "Scholar's Cap",   slot: "hat",     price: 100, emoji: "🎓", overlayEmoji: "🎓", set: "professor-hoot", description: "Tasselled. Rather dignified." },
  { id: "hoot-trousers",    name: "Tweed Trousers",  slot: "bottom",  price: 95,  emoji: "👖", color: "#7a6a4a", set: "professor-hoot", description: "Pressed and patched at both knees." },
  { id: "hoot-loafers",     name: "Library Loafers", slot: "shoes",   price: 85,  emoji: "👞", color: "#5b3a2a", set: "professor-hoot", description: "Quiet enough not to wake the books." },

  // -- PIP (fox) ------------------------------------------------------------
  { id: "pip-scarf",        name: "Fox-Tail Scarf",  slot: "accessory", price: 90, emoji: "🦊", overlayEmoji: "🦊", set: "pip", description: "Bushy and bright. Pip insists it's not from his tail." },
  { id: "pip-sneakers",     name: "Scout Sneakers",  slot: "shoes",   price: 100, emoji: "👟", color: "#c25a2a", set: "pip", description: "Light enough to keep up with Pip. Almost." },
  { id: "pip-hoodie",       name: "Russet Hoodie",   slot: "top",     price: 110, emoji: "🧥", color: "#c25a2a", set: "pip", description: "Warm orange, perfect for blending into autumn." },
  { id: "pip-cap",          name: "Fox-Ear Cap",     slot: "hat",     price: 95,  emoji: "🦊", overlayEmoji: "🦊", set: "pip", description: "Two perky ears, one mischievous grin." },
  { id: "pip-shorts",       name: "Trail Shorts",    slot: "bottom",  price: 65,  emoji: "🩳", color: "#a04420", set: "pip", description: "Quick-dry, very fast on slopes." },

  // -- MOSSBACK (toad) ------------------------------------------------------
  { id: "mossback-hat",     name: "Lily-Pad Hat",    slot: "hat",     price: 110, emoji: "🍃", overlayEmoji: "🪷", set: "mossback", description: "A wide green disc that Mossback definitely didn't sit on first." },
  { id: "mossback-boots",   name: "Pond Wellies",    slot: "shoes",   price: 90,  emoji: "🥾", color: "#3a5a3a", set: "mossback", description: "Splash through any puddle, dignified." },
  { id: "mossback-poncho",  name: "Reed Poncho",     slot: "top",     price: 130, emoji: "🥽", color: "#4a6a3a", set: "mossback", description: "Woven from pond reeds. Surprisingly waterproof." },
  { id: "mossback-pants",   name: "Marsh Trousers",  slot: "bottom",  price: 80,  emoji: "👖", color: "#3a4a2a", set: "mossback", description: "Mottled green — disappears in the reeds." },
  { id: "mossback-amulet",  name: "Pond-Stone Pendant", slot: "accessory", price: 70, emoji: "🪨", overlayEmoji: "🪨", set: "mossback", description: "Smooth and cool. Hums quietly near water." },

  // -- CLOVER (bunny) -------------------------------------------------------
  { id: "clover-flower",    name: "Daisy Crown",     slot: "hat",     price: 70,  emoji: "🌼", overlayEmoji: "🌼", set: "clover", description: "Woven by Clover at sunrise. Smells like meadow." },
  { id: "clover-dress",     name: "Sunshine Smock",  slot: "top",     price: 110, emoji: "👗", color: "#e0c75a", set: "clover", description: "The color of a four-leaf-clover wish." },
  { id: "clover-cardigan",  name: "Petal Cardigan",  slot: "top",     price: 95,  emoji: "🧶", color: "#e8a8c0", set: "clover", description: "Soft pink, with tiny embroidered clovers." },
  { id: "clover-skirt",     name: "Meadow Skirt",    slot: "bottom",  price: 75,  emoji: "👗", color: "#9ac84a", set: "clover", description: "Twirly and grass-stained — the good kind." },
  { id: "clover-shoes",     name: "Hop-Along Shoes", slot: "shoes",   price: 65,  emoji: "👟", color: "#f0d8e8", set: "clover", description: "So bouncy you'll forget you have feet." },
  { id: "clover-charm",     name: "Four-Leaf Charm", slot: "accessory", price: 100, emoji: "🍀", overlayEmoji: "🍀", set: "clover", description: "Clover's lucky favourite. Don't lose it." },
];

export function getItemById(id: string | null | undefined): ShopItem | undefined {
  if (!id) return undefined;
  return SHOP_ITEMS.find((i) => i.id === id);
}

export const COINS_PER_ENTRY = 15;
