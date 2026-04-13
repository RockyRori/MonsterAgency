import { describe, expect, it } from "vitest";
import { mapDefinitions } from "../content/maps";
import { createInitialGameState } from "./create-game-state";
import { settleIdleProgress } from "./idle";

describe("settleIdleProgress", () => {
  it("converts idle farming power into map drops for each full tick", () => {
    const state = createInitialGameState("2026-04-13T00:00:00.000Z");
    const result = settleIdleProgress(
      state,
      "2026-04-13T02:00:00.000Z",
      Object.fromEntries(mapDefinitions.map((map) => [map.id, map])),
      {
        "verdant-border": 4,
      },
    );

    expect(result.settledTicks).toBe(4);
    expect(result.state.inventory["soft-herb"]).toBe(10);
    expect(result.state.inventory["ember-dust"]).toBe(8);
  });
});
