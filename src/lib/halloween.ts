import { QUEST_GIVERS, type QuestGiver } from "./quest-givers";

/** True on October 31 (any year). */
export function isHalloweenDate(date: Date = new Date()): boolean {
  return date.getMonth() === 9 && date.getDate() === 31;
}

/**
 * Costume swap: each NPC dresses up as another NPC for the day.
 * Mapping is a rotation around the cast so every character gets to wear
 * — and be worn as — someone else's outfit.
 */
export const COSTUME_SWAP: Record<string, string> = {
  willow: "jack", // witch dresses as a pirate sparrow
  jack: "pip", // sailor dresses as a fox
  pip: "mossback", // fox dresses as a toad
  mossback: "clover", // toad dresses as a bunny
  clover: "professor-hoot", // bunny dresses as the owl
  "professor-hoot": "willow", // owl dresses as the witch
};

function findGiver(id: string): QuestGiver | undefined {
  return QUEST_GIVERS.find((g) => g.id === id);
}

/** The avatar emoji to render for a given giver. */
export function getDisplayAvatar(giverId: string, halloweenActive: boolean): string {
  const base = findGiver(giverId);
  if (!halloweenActive) return base?.avatar ?? "";
  const costumeId = COSTUME_SWAP[giverId];
  const costume = costumeId ? findGiver(costumeId) : undefined;
  return costume?.avatar ?? base?.avatar ?? "";
}

/** Short label like "dressed as Pip". Returns null when not in costume. */
export function getCostumeLabel(giverId: string, halloweenActive: boolean): string | null {
  if (!halloweenActive) return null;
  const costumeId = COSTUME_SWAP[giverId];
  const costume = costumeId ? findGiver(costumeId) : undefined;
  if (!costume) return null;
  return `dressed as ${costume.name.split(" ")[0]}`;
}
