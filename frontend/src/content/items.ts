import type { ItemDefinition, RecipeDefinition } from "../domain/types";

export const itemDefinitions: ItemDefinition[] = [
  {
    id: "soft-herb",
    name: "柔叶草",
    kind: "material",
    description: "边境草地最常见的基础素材，可用于消耗品和货物制作。",
    baseValue: 6,
  },
  {
    id: "ember-dust",
    name: "余烬粉",
    kind: "material",
    description: "火属性怪物掉落的微热粉末，是强化型配方的基础材料。",
    baseValue: 10,
  },
  {
    id: "iron-scrap",
    name: "铁屑",
    kind: "material",
    description: "洞穴里常见的金属碎片，适合拿来制作外售货物。",
    baseValue: 12,
  },
  {
    id: "moon-sap",
    name: "月露树液",
    kind: "material",
    description: "稀有的夜光树液，常用于高价值订单。",
    baseValue: 20,
  },
  {
    id: "focus-tonic",
    name: "专注药剂",
    kind: "consumable",
    description: "用于稳定队伍节奏的低阶药剂，这个原型里主要作为可卖消耗品。",
    baseValue: 28,
  },
  {
    id: "agency-crate",
    name: "事务所补给箱",
    kind: "trade-good",
    description: "基础外售货物，适合完成低阶订单。",
    baseValue: 54,
  },
  {
    id: "glimmer-lantern",
    name: "辉灯成品",
    kind: "trade-good",
    description: "高价值展示货物，适合拿去完成高回报支线任务。",
    baseValue: 88,
  },
];

export const recipeDefinitions: RecipeDefinition[] = [
  {
    id: "focus-tonic",
    name: "调制专注药剂",
    description: "将草药与余烬粉压缩成战斗支援药剂。",
    inputs: [
      { itemId: "soft-herb", quantity: 2 },
      { itemId: "ember-dust", quantity: 1 },
    ],
    output: { itemId: "focus-tonic", quantity: 1 },
  },
  {
    id: "agency-crate",
    name: "装配补给箱",
    description: "把基础素材压成稳定出货品，适合作为前期现金流。",
    inputs: [
      { itemId: "soft-herb", quantity: 2 },
      { itemId: "iron-scrap", quantity: 1 },
    ],
    output: { itemId: "agency-crate", quantity: 1 },
    craftingPowerThreshold: 6,
  },
  {
    id: "glimmer-lantern",
    name: "打造辉灯成品",
    description: "消耗稀有树液制成高价商品，用于高阶订单与售卖。",
    inputs: [
      { itemId: "moon-sap", quantity: 1 },
      { itemId: "ember-dust", quantity: 1 },
      { itemId: "iron-scrap", quantity: 2 },
    ],
    output: { itemId: "glimmer-lantern", quantity: 1 },
    craftingPowerThreshold: 8,
  },
];
