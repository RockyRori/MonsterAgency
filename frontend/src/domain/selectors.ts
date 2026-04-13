import { gameContent } from "../content";
import { deriveAdventurerStats } from "./stats";
import type { GameState, InventoryEntry } from "./types";

export function getAdventurerById(state: GameState, instanceId: string) {
  return state.adventurers.find((adventurer) => adventurer.instanceId === instanceId);
}

export function getInventoryEntries(state: GameState): InventoryEntry[] {
  return Object.entries(state.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }))
    .sort((left, right) => right.quantity - left.quantity);
}

export function getShowcaseEntries(state: GameState): InventoryEntry[] {
  return Object.entries(state.showcaseInventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }))
    .sort((left, right) => right.quantity - left.quantity);
}

export function getPartyMembers(state: GameState) {
  return state.partyOrder
    .map((instanceId) => getAdventurerById(state, instanceId))
    .filter((adventurer) => Boolean(adventurer))
    .map((adventurer) => {
      const currentAdventurer = adventurer!;
      return {
        adventurer: currentAdventurer,
        definition: gameContent.adventurersById[currentAdventurer.definitionId],
        stats: deriveAdventurerStats(currentAdventurer),
      };
    });
}
