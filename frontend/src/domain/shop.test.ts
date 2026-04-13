import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./create-game-state";
import { runShopShift } from "./shop";

describe("runShopShift", () => {
  it("sells stocked showcase items into gold and lifetime sales", () => {
    const state = createInitialGameState();
    state.showcaseInventory["bronze-sword"] = 1;
    state.showcaseInventory["padded-vest"] = 1;

    const result = runShopShift(state);

    expect(result.goldEarned).toBeGreaterThan(0);
    expect(result.state.lifetime.soldGold).toBe(result.goldEarned);
    expect(result.state.showcaseInventory["bronze-sword"] ?? 0).toBeLessThanOrEqual(1);
  });
});
