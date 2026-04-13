import { removeInventoryEntries } from "./inventory";
import type { GameState } from "./types";

export function getStoreMultiplier(storePower: number): number {
  return 1 + Math.min(0.45, storePower * 0.03);
}

export function sellInventoryItem(
  state: GameState,
  itemId: string,
  quantity: number,
  baseValue: number,
  storePower: number,
): {
  state: GameState;
  goldEarned: number;
} {
  const goldEarned = Math.floor(
    baseValue * quantity * getStoreMultiplier(storePower),
  );

  return {
    state: {
      ...state,
      inventory: removeInventoryEntries(state.inventory, [
        { itemId, quantity },
      ]),
      gold: state.gold + goldEarned,
    },
    goldEarned,
  };
}
