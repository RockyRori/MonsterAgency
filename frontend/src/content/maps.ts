import type { MapDefinition } from "../domain/types";

export const mapDefinitions: MapDefinition[] = [
  {
    id: "verdant-border",
    worldId: "origin-basin",
    name: "青缘边境",
    theme: "草地与低丘",
    description: "新手区域，素材稳定，适合练级与放置采集。",
    difficulty: 1,
    deploymentLimit: 3,
    encounterSize: {
      min: 1,
      max: 2,
    },
    tileData: ["grass", "path", "shrub"],
    collisionData: ["boulder"],
    eventPoints: ["camp", "supply-cache"],
    idleDropTable: [
      { itemId: "soft-herb", quantity: 1 },
      { itemId: "ember-dust", quantity: 1 },
    ],
    encounterPool: [
      {
        monsterTemplateId: "ember-imp",
        weight: 5,
        levelRange: { min: 1, max: 3 },
        loot: [{ itemId: "ember-dust", quantity: 1 }],
        goldReward: 12,
        captureChanceModifier: 1,
      },
      {
        monsterTemplateId: "moss-boar",
        weight: 4,
        levelRange: { min: 1, max: 3 },
        loot: [{ itemId: "soft-herb", quantity: 2 }],
        goldReward: 11,
        captureChanceModifier: 0.92,
      },
      {
        monsterTemplateId: "lantern-sprite",
        weight: 2,
        levelRange: { min: 2, max: 3 },
        loot: [{ itemId: "moon-sap", quantity: 1 }],
        goldReward: 18,
        captureChanceModifier: 0.8,
      },
    ],
  },
  {
    id: "glass-cavern",
    worldId: "origin-basin",
    name: "琉璃洞层",
    theme: "晶簇洞穴",
    description: "第二张地图，怪物更耐打，也能产出更高价值的金属与树液。",
    difficulty: 2,
    deploymentLimit: 3,
    encounterSize: {
      min: 2,
      max: 3,
    },
    tileData: ["crystal", "stone", "ore"],
    collisionData: ["pillar"],
    eventPoints: ["ore-vein", "sealed-gate"],
    idleDropTable: [
      { itemId: "iron-scrap", quantity: 1 },
      { itemId: "moon-sap", quantity: 1 },
    ],
    encounterPool: [
      {
        monsterTemplateId: "ember-imp",
        weight: 2,
        levelRange: { min: 3, max: 5 },
        loot: [{ itemId: "ember-dust", quantity: 2 }],
        goldReward: 18,
        captureChanceModifier: 0.88,
      },
      {
        monsterTemplateId: "basalt-golem",
        weight: 3,
        levelRange: { min: 4, max: 5 },
        loot: [{ itemId: "iron-scrap", quantity: 2 }],
        goldReward: 24,
        captureChanceModifier: 0.72,
      },
      {
        monsterTemplateId: "mist-eel",
        weight: 4,
        levelRange: { min: 3, max: 5 },
        loot: [
          { itemId: "moon-sap", quantity: 1 },
          { itemId: "iron-scrap", quantity: 1 },
        ],
        goldReward: 22,
        captureChanceModifier: 0.84,
      },
    ],
  },
];
