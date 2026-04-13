import { gameContent } from "../content";
import { mergeInventoryEntries } from "./inventory";
import { getPartyMembers } from "./selectors";
import { deriveAdventurerStats } from "./stats";
import type { BattleState, BattleUnitState, GameState } from "./types";

function createBattleClock(speed: number): number {
  return 100 / Math.max(speed, 1);
}

function livingUnits(units: BattleUnitState[]): BattleUnitState[] {
  return units.filter((unit) => unit.currentHealth > 0);
}

function resolveDamage(actor: BattleUnitState, target: BattleUnitState): number {
  return Math.max(1, Math.round(actor.attack * 1.08 - target.defense * 0.55));
}

function nextActor(state: BattleState): BattleUnitState | null {
  const units = [...livingUnits(state.playerUnits), ...livingUnits(state.enemyUnits)];

  if (units.length === 0) {
    return null;
  }

  return units.sort((left, right) => left.nextActionAt - right.nextActionAt)[0];
}

function applyAttack(
  units: BattleUnitState[],
  targetId: string,
  damage: number,
): BattleUnitState[] {
  return units.map((unit) =>
    unit.unitId === targetId
      ? { ...unit, currentHealth: Math.max(0, unit.currentHealth - damage) }
      : unit,
  );
}

function finalizeBattle(state: BattleState): BattleState {
  const playersAlive = livingUnits(state.playerUnits).length > 0;
  const enemiesAlive = livingUnits(state.enemyUnits).length > 0;

  if (!playersAlive) {
    return {
      ...state,
      phase: "defeat",
      activeUnitId: null,
      log: [...state.log, "本次远征失利，只能先撤回店里重新整备。"],
    };
  }

  if (!enemiesAlive) {
    return {
      ...state,
      phase: "victory",
      activeUnitId: null,
      log: [...state.log, "战斗胜利，素材和赏金可以带回店里了。"],
    };
  }

  return state;
}

function stabilizeBattle(state: BattleState): BattleState {
  let current = finalizeBattle(state);
  let guard = 0;

  while (current.phase !== "victory" && current.phase !== "defeat" && guard < 20) {
    guard += 1;
    const actor = nextActor(current);

    if (!actor) {
      return finalizeBattle(current);
    }

    if (actor.team === "player") {
      return {
        ...current,
        phase: "player_turn",
        activeUnitId: actor.unitId,
      };
    }

    const target = livingUnits(current.playerUnits).sort(
      (left, right) => left.currentHealth - right.currentHealth,
    )[0];

    if (!target) {
      return finalizeBattle(current);
    }

    const damage = resolveDamage(actor, target);
    current = finalizeBattle({
      ...current,
      playerUnits: applyAttack(current.playerUnits, target.unitId, damage),
      enemyUnits: current.enemyUnits.map((unit) =>
        unit.unitId === actor.unitId
          ? { ...unit, nextActionAt: unit.nextActionAt + createBattleClock(unit.speed) }
          : unit,
      ),
      log: [
        ...current.log,
        `${actor.icon}${actor.name} 攻击 ${target.icon}${target.name}，造成 ${damage} 点伤害。`,
      ],
    });
  }

  return current;
}

export function createBattleState(
  state: GameState,
  encounterId: string,
): BattleState {
  const encounter = gameContent.encountersById[encounterId];
  const playerUnits = getPartyMembers(state).map(({ adventurer, definition }) => {
    const stats = deriveAdventurerStats(adventurer);
    return {
      unitId: adventurer.instanceId,
      name: definition.name,
      icon: definition.visuals.emoji,
      team: "player" as const,
      sourceId: adventurer.instanceId,
      maxHealth: stats.maxHealth,
      currentHealth: stats.maxHealth,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      nextActionAt: createBattleClock(stats.speed),
      rewardGold: 0,
      rewardItems: [],
    };
  });
  const enemyUnits = encounter.enemyIds.map((enemyId, index) => {
    const enemy = gameContent.enemiesById[enemyId];
    return {
      unitId: `${encounterId}-${enemy.id}-${index}`,
      name: enemy.name,
      icon: enemy.visuals.emoji,
      team: "enemy" as const,
      sourceId: enemy.id,
      maxHealth: enemy.baseStats.maxHealth,
      currentHealth: enemy.baseStats.maxHealth,
      attack: enemy.baseStats.attack,
      defense: enemy.baseStats.defense,
      speed: enemy.baseStats.speed,
      nextActionAt: createBattleClock(enemy.baseStats.speed),
      rewardGold: enemy.goldDrop,
      rewardItems: enemy.itemDrops,
    };
  });

  return stabilizeBattle({
    mapId: state.currentMapId,
    encounterId,
    phase: "player_turn",
    playerUnits,
    enemyUnits,
    activeUnitId: null,
    log: [`遭遇战开始：${encounter.name}`],
  });
}

export function performPlayerAttack(
  state: BattleState,
  targetEnemyId: string,
): BattleState {
  if (state.phase !== "player_turn" || !state.activeUnitId) {
    return state;
  }

  const actor = state.playerUnits.find((unit) => unit.unitId === state.activeUnitId);
  const target = state.enemyUnits.find((unit) => unit.unitId === targetEnemyId);

  if (!actor || !target || target.currentHealth <= 0) {
    return state;
  }

  const damage = resolveDamage(actor, target);

  return stabilizeBattle({
    ...state,
    enemyUnits: applyAttack(state.enemyUnits, targetEnemyId, damage),
    playerUnits: state.playerUnits.map((unit) =>
      unit.unitId === actor.unitId
        ? { ...unit, nextActionAt: unit.nextActionAt + createBattleClock(unit.speed) }
        : unit,
    ),
    log: [
      ...state.log,
      `${actor.icon}${actor.name} 攻击 ${target.icon}${target.name}，造成 ${damage} 点伤害。`,
    ],
  });
}

export function getBattleRewards(state: BattleState) {
  const defeatedEnemies = state.enemyUnits.filter((unit) => unit.currentHealth <= 0);

  return {
    gold: defeatedEnemies.reduce((total, enemy) => total + enemy.rewardGold, 0),
    items: mergeInventoryEntries(
      defeatedEnemies.flatMap((enemy) => enemy.rewardItems),
    ),
  };
}
