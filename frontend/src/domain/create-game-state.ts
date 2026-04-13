import { createExplorationState } from "./exploration";
import type { AdventurerAssignment, AdventurerState, GameState } from "./types";

interface BuildAdventurerStateInput {
  instanceId: string;
  definitionId: string;
  level: number;
  assignment: AdventurerAssignment;
}

export function buildAdventurerState(
  input: BuildAdventurerStateInput,
): AdventurerState {
  return {
    instanceId: input.instanceId,
    definitionId: input.definitionId,
    level: input.level,
    exp: 0,
    assignment: input.assignment,
    equipment: {},
  };
}

export function createInitialGameState(): GameState {
  return {
    version: 2,
    gold: 120,
    inventory: {
      "copper-ore": 8,
      "beast-hide": 5,
      "wind-thread": 4,
      "crystal-shard": 1,
      "bronze-sword": 1,
      "padded-vest": 1,
    },
    showcaseInventory: {},
    adventurers: [
      {
        ...buildAdventurerState({
          instanceId: "adv-lyra",
          definitionId: "lyra",
          level: 2,
          assignment: "party",
        }),
        equipment: {
          weapon: "bronze-sword",
          armor: "padded-vest",
        },
      },
      {
        ...buildAdventurerState({
          instanceId: "adv-mira",
          definitionId: "mira",
          level: 2,
          assignment: "counter",
        }),
        equipment: {
          weapon: "oak-wand",
          armor: "linen-coat",
        },
      },
      {
        ...buildAdventurerState({
          instanceId: "adv-torr",
          definitionId: "torr",
          level: 2,
          assignment: "party",
        }),
        equipment: {
          weapon: "hunter-knife",
          armor: "scout-cloak",
        },
      },
      {
        ...buildAdventurerState({
          instanceId: "adv-selene",
          definitionId: "selene",
          level: 1,
          assignment: "smithy",
        }),
        equipment: {
          weapon: "apprentice-orb",
          armor: "linen-coat",
        },
      },
    ],
    partyOrder: ["adv-lyra", "adv-torr"],
    unlockedMapIds: ["copper-trail"],
    unlockedRecipeIds: ["bronze-sword", "padded-vest", "hunter-knife"],
    currentMapId: "copper-trail",
    exploration: createExplorationState("copper-trail"),
    battle: null,
    lifetime: {
      craftedCounts: {},
      soldGold: 0,
      clearedMapIds: [],
    },
    questStates: {},
    recentActivities: [
      "店铺重新开张，先把第一批基础装备和展示货跑起来。",
      "锻造、上架、探索三条线已经同时启动。",
    ],
  };
}
