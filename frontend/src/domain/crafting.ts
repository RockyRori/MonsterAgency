import {
  addInventoryEntries,
  hasInventory,
  removeInventoryEntries,
} from "./inventory";
import type { GameState, RecipeDefinition } from "./types";

export function getCraftingBonusQuantity(
  recipe: RecipeDefinition,
  craftingPower: number,
): number {
  if (!recipe.craftingPowerThreshold) {
    return 0;
  }

  return Math.floor(craftingPower / recipe.craftingPowerThreshold);
}

export function canCraftRecipe(
  state: GameState,
  recipe: RecipeDefinition,
): boolean {
  return hasInventory(state.inventory, recipe.inputs);
}

export function craftRecipe(
  state: GameState,
  recipe: RecipeDefinition,
  craftingPower: number,
): {
  state: GameState;
  producedQuantity: number;
} {
  const bonusQuantity = getCraftingBonusQuantity(recipe, craftingPower);
  const producedQuantity = recipe.output.quantity + bonusQuantity;
  const spentInventory = removeInventoryEntries(state.inventory, recipe.inputs);
  const nextInventory = addInventoryEntries(spentInventory, [
    { itemId: recipe.output.itemId, quantity: producedQuantity },
  ]);

  return {
    state: {
      ...state,
      inventory: nextInventory,
    },
    producedQuantity,
  };
}
