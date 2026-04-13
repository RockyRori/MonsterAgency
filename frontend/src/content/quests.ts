import type { QuestDefinition } from "../domain/types";

export const questDefinitions: QuestDefinition[] = [
  {
    id: "main-open-cavern",
    type: "main",
    name: "勘探第一站",
    description: "在青缘边境取得 2 次胜利，向事务所证明你能稳定派出队伍。",
    requirements: [
      {
        type: "mapWins",
        mapId: "verdant-border",
        wins: 2,
      },
    ],
    rewards: {
      gold: 45,
      items: [{ itemId: "iron-scrap", quantity: 2 }],
      unlocksMapId: "glass-cavern",
    },
  },
  {
    id: "side-supply-contract",
    type: "side",
    name: "边境补给订单",
    description: "交付 2 个补给箱，换取事务所现金流与额外素材。",
    requirements: [
      {
        type: "items",
        items: [{ itemId: "agency-crate", quantity: 2 }],
      },
    ],
    rewards: {
      gold: 130,
      items: [{ itemId: "focus-tonic", quantity: 1 }],
    },
  },
  {
    id: "side-night-market",
    type: "side",
    name: "夜市陈列委托",
    description: "交付 1 个辉灯成品，换取高额金币奖励。",
    requirements: [
      {
        type: "items",
        items: [{ itemId: "glimmer-lantern", quantity: 1 }],
      },
    ],
    rewards: {
      gold: 180,
      items: [{ itemId: "moon-sap", quantity: 1 }],
    },
  },
];
