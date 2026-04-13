import type { GameState, MonsterAssignment, MonsterInstance } from "./types";

interface BuildMonsterInstanceInput {
  instanceId: string;
  templateId: string;
  level: number;
  starRank?: number;
  isShiny?: boolean;
  assignment: MonsterAssignment;
  currentMapId: string;
}

export function buildMonsterInstance(
  input: BuildMonsterInstanceInput,
): MonsterInstance {
  return {
    instanceId: input.instanceId,
    templateId: input.templateId,
    isShiny: input.isShiny ?? false,
    level: input.level,
    exp: 0,
    starRank: input.starRank ?? 0,
    shinyStarRank: 0,
    skills: [],
    equips: [],
    traits: [],
    currentAssignment: input.assignment,
    currentMapId: input.currentMapId,
    lockState: "available",
  };
}

export function createInitialGameState(
  nowIso: string = new Date().toISOString(),
): GameState {
  return {
    version: 1,
    currentMapId: "verdant-border",
    unlockedMapIds: ["verdant-border"],
    inventory: {
      "soft-herb": 6,
      "ember-dust": 4,
      "iron-scrap": 2,
    },
    gold: 70,
    monsters: [
      buildMonsterInstance({
        instanceId: "monster-ember-1",
        templateId: "ember-imp",
        level: 2,
        assignment: { type: "combat", mapId: "verdant-border" },
        currentMapId: "verdant-border",
      }),
      buildMonsterInstance({
        instanceId: "monster-boar-1",
        templateId: "moss-boar",
        level: 2,
        assignment: { type: "combat", mapId: "verdant-border" },
        currentMapId: "verdant-border",
      }),
      buildMonsterInstance({
        instanceId: "monster-sprite-1",
        templateId: "lantern-sprite",
        level: 1,
        assignment: { type: "crafting" },
        currentMapId: "verdant-border",
      }),
      buildMonsterInstance({
        instanceId: "monster-ember-2",
        templateId: "ember-imp",
        level: 1,
        assignment: { type: "idle", mapId: "verdant-border" },
        currentMapId: "verdant-border",
      }),
    ],
    activeLineup: ["monster-ember-1", "monster-boar-1"],
    mapProgress: {
      "verdant-border": { wins: 0 },
      "glass-cavern": { wins: 0 },
    },
    questStates: {},
    time: {
      lastIdleSettlementAt: nowIso,
    },
    recentActivities: [
      "事务所重新开张，先从青缘边境建立资源循环。",
      "已有一只余烬小鬼正在边境执行放置任务。",
    ],
  };
}
