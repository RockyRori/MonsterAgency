import { describe, expect, it } from "vitest";
import { gameContent } from "../content";
import { createInitialGameState } from "./create-game-state";
import { applyTileEventRewards, createExplorationState } from "./exploration";

describe("exploration events", () => {
  it("grants node rewards when stepping on a fresh resource tile", () => {
    const state = {
      ...createInitialGameState(),
      exploration: createExplorationState("copper-trail"),
    };
    const tileKey = "3,2";
    const result = applyTileEventRewards(state, tileKey);

    expect(result.message).toBe(gameContent.mapsById["copper-trail"].tileEvents[tileKey].message);
    expect(result.state.inventory["copper-ore"]).toBe(10);
    expect(result.state.inventory["beast-hide"]).toBe(6);
  });
});
