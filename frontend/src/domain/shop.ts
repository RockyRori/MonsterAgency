import { gameContent } from "../content";
import { addInventoryEntries, normalizeInventory, removeInventoryEntries } from "./inventory";
import type { GameState } from "./types";

export function getCounterPower(state: GameState): number {
  return state.adventurers
    .filter((adventurer) => adventurer.assignment === "counter")
    .reduce((total, adventurer) => {
      const definition = gameContent.adventurersById[adventurer.definitionId];
      return total + definition.utilityProfile.sales;
    }, 0);
}

export function stockShowcaseItem(
  state: GameState,
  itemId: string,
): GameState {
  return {
    ...state,
    inventory: removeInventoryEntries(state.inventory, [{ itemId, quantity: 1 }]),
    showcaseInventory: normalizeInventory({
      ...state.showcaseInventory,
      [itemId]: (state.showcaseInventory[itemId] ?? 0) + 1,
    }),
  };
}

export function returnShowcaseItem(
  state: GameState,
  itemId: string,
): GameState {
  return {
    ...state,
    inventory: addInventoryEntries(state.inventory, [{ itemId, quantity: 1 }]),
    showcaseInventory: removeInventoryEntries(state.showcaseInventory, [
      { itemId, quantity: 1 },
    ]),
  };
}

export function runShopShift(state: GameState): {
  state: GameState;
  soldItems: { itemId: string; quantity: number }[];
  goldEarned: number;
} {
  const counterPower = getCounterPower(state);
  const salesCapacity = Math.max(1, 1 + Math.floor(counterPower / 3));
  const margin = 1.05 + Math.min(0.35, counterPower * 0.025);
  const stockedItems = Object.entries(state.showcaseInventory)
    .filter(([, quantity]) => quantity > 0)
    .sort(
      ([leftItemId], [rightItemId]) =>
        gameContent.itemDefinitionsById[rightItemId].baseValue -
        gameContent.itemDefinitionsById[leftItemId].baseValue,
    );

  const soldItems: { itemId: string; quantity: number }[] = [];
  let soldCount = 0;
  let goldEarned = 0;
  let showcaseInventory = { ...state.showcaseInventory };

  stockedItems.forEach(([itemId, quantity]) => {
    while (quantity > 0 && soldCount < salesCapacity && (showcaseInventory[itemId] ?? 0) > 0) {
      soldCount += 1;
      showcaseInventory[itemId] -= 1;
      goldEarned += Math.floor(
        gameContent.itemDefinitionsById[itemId].baseValue * margin,
      );

      const existing = soldItems.find((entry) => entry.itemId === itemId);

      if (existing) {
        existing.quantity += 1;
      } else {
        soldItems.push({ itemId, quantity: 1 });
      }
    }
  });

  return {
    state: {
      ...state,
      gold: state.gold + goldEarned,
      showcaseInventory: normalizeInventory(showcaseInventory),
      lifetime: {
        ...state.lifetime,
        soldGold: state.lifetime.soldGold + goldEarned,
      },
    },
    soldItems,
    goldEarned,
  };
}
