import { describe, expect, it } from "vitest";
import { resolveBattle } from "./battle";
import type { BattleUnit } from "./types";

function createBattleUnit(overrides: Partial<BattleUnit>): BattleUnit {
  return {
    unitId: "unit",
    name: "Test Unit",
    templateId: "test-template",
    icon: "T",
    level: 1,
    maxHealth: 60,
    currentHealth: 60,
    attack: 14,
    defense: 8,
    speed: 12,
    nextActionAt: 100 / 12,
    loot: [],
    goldReward: 0,
    captureChance: 0.3,
    ...overrides,
  };
}

describe("resolveBattle", () => {
  it("returns victory rewards when the player defeats the encounter", () => {
    const playerParty = [
      createBattleUnit({
        unitId: "player-1",
        name: "Player",
        attack: 18,
        defense: 10,
        speed: 16,
      }),
    ];

    const enemyParty = [
      createBattleUnit({
        unitId: "enemy-1",
        name: "Enemy",
        attack: 8,
        defense: 4,
        speed: 9,
        maxHealth: 42,
        currentHealth: 42,
        loot: [{ itemId: "soft-herb", quantity: 2 }],
        goldReward: 25,
      }),
    ];

    const result = resolveBattle(playerParty, enemyParty);

    expect(result.winner).toBe("player");
    expect(result.rewards.gold).toBe(25);
    expect(result.rewards.items).toEqual([
      { itemId: "soft-herb", quantity: 2 },
    ]);
    expect(result.captureCandidates).toHaveLength(1);
  });
});
