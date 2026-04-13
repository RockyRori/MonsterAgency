import { describe, expect, it } from "vitest";
import { gameContent } from "../content";
import { createInitialGameState } from "./create-game-state";
import { canCraftRecipe, craftRecipe } from "./crafting";

describe("craftRecipe", () => {
  it("requires unlocked recipe, materials, and smithing power", () => {
    const state = createInitialGameState();
    const recipe = gameContent.recipeDefinitionsById["bronze-sword"];

    expect(canCraftRecipe(state, recipe)).toBe(true);

    const result = craftRecipe(state, recipe);

    expect(result.inventory["bronze-sword"]).toBe(2);
    expect(result.inventory["copper-ore"]).toBe(5);
    expect(result.lifetime.craftedCounts["bronze-sword"]).toBe(1);
  });
});
