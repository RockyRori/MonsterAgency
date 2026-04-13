import { describe, expect, it } from "vitest";
import { recipeDefinitions } from "../content/items";
import { createInitialGameState } from "./create-game-state";
import { craftRecipe } from "./crafting";

describe("craftRecipe", () => {
  it("adds deterministic bonus output when crafting power passes the threshold", () => {
    const state = createInitialGameState();
    const recipe = recipeDefinitions.find((entry) => entry.id === "agency-crate");

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const result = craftRecipe(state, recipe, 12);

    expect(result.producedQuantity).toBe(3);
    expect(result.state.inventory["agency-crate"]).toBe(3);
    expect(result.state.inventory["soft-herb"]).toBe(4);
    expect(result.state.inventory["iron-scrap"]).toBe(1);
  });
});
