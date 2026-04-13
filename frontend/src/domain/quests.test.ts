import { describe, expect, it } from "vitest";
import { questDefinitions } from "../content/quests";
import { createInitialGameState } from "./create-game-state";
import { canCompleteQuest, completeQuest } from "./quests";

describe("quests", () => {
  it("unlocks the second map when the main quest is completed", () => {
    const state = createInitialGameState();
    state.mapProgress["verdant-border"].wins = 2;
    const quest = questDefinitions.find((entry) => entry.id === "main-open-cavern");

    if (!quest) {
      throw new Error("Quest not found");
    }

    expect(canCompleteQuest(state, quest)).toBe(true);

    const result = completeQuest(state, quest, "2026-04-13T08:00:00.000Z");

    expect(result.unlockedMapIds).toContain("glass-cavern");
    expect(result.questStates[quest.id]?.status).toBe("claimed");
  });
});
