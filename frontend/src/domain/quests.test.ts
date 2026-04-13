import { describe, expect, it } from "vitest";
import { gameContent } from "../content";
import { createInitialGameState } from "./create-game-state";
import { canCompleteQuest, completeQuest } from "./quests";

describe("quests", () => {
  it("unlocks the second map when the clear-map quest is completed", () => {
    const state = createInitialGameState();
    state.lifetime.clearedMapIds.push("copper-trail");
    const quest = gameContent.questsById["clear-copper-trail"];

    expect(canCompleteQuest(state, quest)).toBe(true);

    const result = completeQuest(state, quest, "2026-04-13T08:00:00.000Z");

    expect(result.unlockedMapIds).toContain("crystal-shaft");
    expect(result.questStates[quest.id]?.status).toBe("claimed");
    expect(result.unlockedRecipeIds).toContain("iron-greataxe");
  });
});
