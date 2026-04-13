import { describe, expect, it } from "vitest";
import { createBattleState, performPlayerAttack } from "./battle";
import { createInitialGameState } from "./create-game-state";

describe("battle timeline", () => {
  it("keeps waiting for manual player input while enemies are alive", () => {
    const state = createInitialGameState();
    const battle = createBattleState(state, "trail-wolf");

    expect(battle.phase).toBe("player_turn");
    expect(battle.activeUnitId).toBeTruthy();

    const target = battle.enemyUnits[0];
    const nextBattle = performPlayerAttack(battle, target.unitId);

    expect(["player_turn", "victory"]).toContain(nextBattle.phase);
    expect(nextBattle.log.length).toBeGreaterThan(battle.log.length);
  });
});
