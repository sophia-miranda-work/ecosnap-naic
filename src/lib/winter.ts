import { QUEST_GIVERS } from "./quest-givers";
import { getDisplayAvatar as getCostumeAvatar } from "./halloween";

/**
 * Winter substitutes — when Winter Mode is active, the regular cast is
 * hibernating, migrating, or on holiday, so friends and family fill in.
 * Mapping: regular NPC id → winter stand-in.
 */
export type WinterSubstitute = {
  name: string;
  role: string;
  avatar: string;
  /** "filling in for X" label shown in the UI. */
  fillingInFor: string;
};

export const WINTER_SUBSTITUTES: Record<string, WinterSubstitute> = {
  willow: {
    name: "Oakley",
    role: "the Frosty Enchanter",
    avatar: "🧙‍♂️",
    fillingInFor: "Willow",
  },
  "professor-hoot": {
    name: "Hedwig",
    role: "the Snowy Librarian",
    avatar: "🦉",
    fillingInFor: "Professor Hoot",
  },
  pip: {
    name: "Nicholas",
    role: "the Arctic Fox",
    avatar: "🦊",
    fillingInFor: "Pip",
  },
  mossback: {
    name: "Skipper",
    role: "the Penguin Friend",
    avatar: "🐧",
    fillingInFor: "Mossback",
  },
  clover: {
    name: "Poppy",
    role: "the Arctic Hare",
    avatar: "🐇",
    fillingInFor: "Clover",
  },
  jack: {
    name: "Hunter",
    role: "the Kingfisher Crewmate",
    avatar: "🐦",
    fillingInFor: "Jack",
  },
  // Björn the shopkeeper bear → his polar bear cousin.
  bjorn: {
    name: "Eisbär",
    role: "the Polar Bear Cousin",
    avatar: "🐻‍❄️",
    fillingInFor: "Björn",
  },
};

export function getWinterSubstitute(id: string): WinterSubstitute | undefined {
  return WINTER_SUBSTITUTES[id];
}

/**
 * Resolve display details for an NPC, honoring (in priority order):
 *  1. Halloween costume swap (avatar only) — Halloween wins.
 *  2. Winter substitute (full identity swap).
 *  3. The base character.
 */
export function getDisplayGiver(
  id: string,
  opts: { halloweenActive?: boolean; winterActive?: boolean } = {},
): { name: string; role: string; avatar: string; swapLabel: string | null } {
  const base = QUEST_GIVERS.find((g) => g.id === id);
  const baseName = base?.name ?? "";
  const baseRole = base?.role ?? "";
  const baseAvatar = base?.avatar ?? "";

  if (opts.halloweenActive) {
    return {
      name: baseName,
      role: baseRole,
      avatar: getCostumeAvatar(id, true),
      swapLabel: null,
    };
  }
  if (opts.winterActive) {
    const sub = WINTER_SUBSTITUTES[id];
    if (sub) {
      return {
        name: sub.name,
        role: sub.role,
        avatar: sub.avatar,
        swapLabel: `filling in for ${sub.fillingInFor}`,
      };
    }
  }
  return { name: baseName, role: baseRole, avatar: baseAvatar, swapLabel: null };
}