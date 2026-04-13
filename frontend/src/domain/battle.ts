import { gameContent } from "../content";
import { mergeInventoryEntries } from "./inventory";
import { deriveMonsterStats } from "./monster-rules";
import { getMonsterById } from "./selectors";
import type {
  BattleResolution,
  BattleUnit,
  GameState,
  MapDefinition,
  MonsterInstance,
} from "./types";

function createBattleClock(speed: number): number {
  return 100 / Math.max(speed, 1);
}

function pickWeightedIndex(weights: number[], roll: number): number {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const target = roll * totalWeight;
  let cursor = 0;

  for (let index = 0; index < weights.length; index += 1) {
    cursor += weights[index];

    if (target <= cursor) {
      return index;
    }
  }

  return weights.length - 1;
}

function createBattleUnitFromMonster(
  monster: MonsterInstance,
  mapId: string,
): BattleUnit {
  const template = gameContent.monsterTemplatesById[monster.templateId];
  const stats = deriveMonsterStats(monster, template);

  if (!template.allowedMapIds.includes(mapId)) {
    throw new Error(`${template.name} cannot fight on map ${mapId}`);
  }

  return {
    unitId: monster.instanceId,
    name: template.name,
    templateId: template.id,
    icon: template.visuals.emoji,
    level: monster.level,
    maxHealth: stats.maxHealth,
    currentHealth: stats.maxHealth,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    nextActionAt: createBattleClock(stats.speed),
    loot: [],
    goldReward: 0,
    captureChance: 0,
  };
}

export function createPlayerBattleParty(
  state: GameState,
  mapId: string,
): BattleUnit[] {
  return state.activeLineup
    .map((instanceId) => getMonsterById(state, instanceId))
    .filter((monster): monster is MonsterInstance => Boolean(monster))
    .map((monster) => createBattleUnitFromMonster(monster, mapId));
}

export function buildEncounterParty(
  map: MapDefinition,
  randomValues: number[],
): BattleUnit[] {
  const values = [...randomValues];
  const groupSizeRoll = values.shift() ?? 0.5;
  const groupSize =
    map.encounterSize.min +
    Math.floor(
      groupSizeRoll * (map.encounterSize.max - map.encounterSize.min + 1),
    );

  return Array.from({ length: groupSize }, (_, index) => {
    const pickRoll = values.shift() ?? Math.random();
    const levelRoll = values.shift() ?? Math.random();
    const encounterIndex = pickWeightedIndex(
      map.encounterPool.map((encounter) => encounter.weight),
      pickRoll,
    );
    const encounter = map.encounterPool[encounterIndex];
    const template = gameContent.monsterTemplatesById[encounter.monsterTemplateId];
    const level =
      encounter.levelRange.min +
      Math.floor(
        levelRoll *
          (encounter.levelRange.max - encounter.levelRange.min + 1),
      );
    const stats = deriveMonsterStats(
      {
        instanceId: `enemy-${template.id}-${index}`,
        templateId: template.id,
        isShiny: false,
        level,
        exp: 0,
        starRank: map.difficulty - 1,
        shinyStarRank: 0,
        skills: [],
        equips: [],
        traits: [],
        currentAssignment: { type: "combat", mapId: map.id },
        currentMapId: map.id,
        lockState: "available",
      },
      template,
    );

    return {
      unitId: `enemy-${template.id}-${index}`,
      name: template.name,
      templateId: template.id,
      icon: template.visuals.emoji,
      level,
      maxHealth: stats.maxHealth,
      currentHealth: stats.maxHealth,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      nextActionAt: createBattleClock(stats.speed),
      loot: encounter.loot,
      goldReward: encounter.goldReward,
      captureChance: template.captureRate * encounter.captureChanceModifier,
    };
  });
}

export function resolveBattle(
  playerParty: BattleUnit[],
  enemyParty: BattleUnit[],
): BattleResolution {
  const players = playerParty.map((unit) => ({ ...unit }));
  const enemies = enemyParty.map((unit) => ({ ...unit }));
  const battleLog: string[] = [];
  const defeatedEnemies: BattleUnit[] = [];
  let playerIndex = 0;
  let enemyIndex = 0;
  let currentTime = 0;
  let safety = 0;

  while (
    playerIndex < players.length &&
    enemyIndex < enemies.length &&
    safety < 120
  ) {
    safety += 1;
    const player = players[playerIndex];
    const enemy = enemies[enemyIndex];
    const playerActs = player.nextActionAt <= enemy.nextActionAt;
    const actor = playerActs ? player : enemy;
    const target = playerActs ? enemy : player;
    currentTime = actor.nextActionAt;
    const rawDamage = actor.attack * 1.12 - target.defense * 0.62;
    const damage = Math.max(1, Math.round(rawDamage));

    target.currentHealth = Math.max(0, target.currentHealth - damage);
    battleLog.push(
      `${currentTime.toFixed(1)}s ${actor.icon}${actor.name} 对 ${target.icon}${target.name} 造成 ${damage} 点伤害。`,
    );
    actor.nextActionAt += createBattleClock(actor.speed);

    if (target.currentHealth === 0) {
      battleLog.push(
        `${currentTime.toFixed(1)}s ${target.icon}${target.name} 倒下。`,
      );

      if (playerActs) {
        defeatedEnemies.push(target);
        enemyIndex += 1;

        if (enemyIndex < enemies.length) {
          enemies[enemyIndex].nextActionAt =
            currentTime + createBattleClock(enemies[enemyIndex].speed);
        }
      } else {
        playerIndex += 1;

        if (playerIndex < players.length) {
          players[playerIndex].nextActionAt =
            currentTime + createBattleClock(players[playerIndex].speed);
        }
      }
    }
  }

  const winner = enemyIndex >= enemies.length ? "player" : "enemy";
  const rewards =
    winner === "player"
      ? {
          gold: defeatedEnemies.reduce(
            (total, enemy) => total + enemy.goldReward,
            0,
          ),
          items: mergeInventoryEntries(
            defeatedEnemies.flatMap((enemy) => enemy.loot),
          ),
        }
      : { gold: 0, items: [] };

  battleLog.push(
    winner === "player"
      ? "我方取得胜利，事务所资源链继续扩张。"
      : "本次出击失利，先调整编队和岗位再继续。",
  );

  return {
    winner,
    log: battleLog,
    rewards,
    survivingPlayerUnits: players.length - playerIndex,
    captureCandidates:
      winner === "player"
        ? defeatedEnemies.map((enemy) => ({
            templateId: enemy.templateId,
            level: enemy.level,
            captureChance: enemy.captureChance,
          }))
        : [],
  };
}
