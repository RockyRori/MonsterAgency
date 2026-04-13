import { gameContent } from "../content";
import { addInventoryEntries, hasInventory, removeInventoryEntries } from "./inventory";
import type { GameState, RecipeDefinition } from "./types";

export function getSmithingPower(state: GameState): number {
  return state.adventurers
    .filter((adventurer) => adventurer.assignment === "smithy")
    .reduce((total, adventurer) => {
      const definition = gameContent.adventurersById[adventurer.definitionId];
      return total + definition.utilityProfile.smithing;
    }, 0);
}

export function canCraftRecipe(
  state: GameState,
  recipe: RecipeDefinition,
): boolean {
  return (
    state.unlockedRecipeIds.includes(recipe.id) &&
    hasInventory(state.inventory, recipe.inputs) &&
    getSmithingPower(state) >= recipe.requiredSmithing
  );
}

export function craftRecipe(
  state: GameState,
  recipe: RecipeDefinition,
): GameState {
  const spentInventory = removeInventoryEntries(state.inventory, recipe.inputs);
  const nextInventory = addInventoryEntries(spentInventory, [recipe.output]);

  return {
    ...state,
    inventory: nextInventory,
    lifetime: {
      ...state.lifetime,
      craftedCounts: {
        ...state.lifetime.craftedCounts,
        [recipe.output.itemId]:
          (state.lifetime.craftedCounts[recipe.output.itemId] ?? 0) +
          recipe.output.quantity,
      },
    },
  };
}
