export type Rarity = "common" | "uncommon" | "rare";
export type AdventurerAssignment = "party" | "smithy" | "counter" | "rest";
export type ItemKind = "material" | "equipment" | "consumable";
export type EquipmentSlot = "weapon" | "armor" | "accessory";
export type QuestType = "main" | "request";
export type BattlePhase = "player_turn" | "victory" | "defeat";

export interface CombatStats {
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface UtilityProfile {
  smithing: number;
  sales: number;
  scouting: number;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface AdventurerDefinition {
  id: string;
  name: string;
  title: string;
  role: string;
  rarity: Rarity;
  baseStats: CombatStats;
  growth: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  utilityProfile: UtilityProfile;
  startingEquipmentIds: string[];
  visuals: {
    emoji: string;
    accent: string;
  };
}

export interface EquipmentBonuses {
  maxHealth?: number;
  attack?: number;
  defense?: number;
  speed?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  kind: ItemKind;
  description: string;
  baseValue: number;
  equipmentSlot?: EquipmentSlot;
  statBonuses?: EquipmentBonuses;
  tags: string[];
}

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  inputs: InventoryEntry[];
  output: InventoryEntry;
  requiredSmithing: number;
}

export interface AdventurerState {
  instanceId: string;
  definitionId: string;
  level: number;
  exp: number;
  assignment: AdventurerAssignment;
  equipment: Partial<Record<EquipmentSlot, string>>;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  level: number;
  baseStats: CombatStats;
  goldDrop: number;
  itemDrops: InventoryEntry[];
  visuals: {
    emoji: string;
    accent: string;
  };
}

export interface EncounterDefinition {
  id: string;
  name: string;
  enemyIds: string[];
}

export type MapTileEvent =
  | {
      type: "resource";
      rewards: InventoryEntry[];
      message: string;
    }
  | {
      type: "treasure";
      gold: number;
      message: string;
    }
  | {
      type: "battle";
      encounterId: string;
      message: string;
    }
  | {
      type: "exit";
      message: string;
    };

export interface MapDefinition {
  id: string;
  name: string;
  theme: string;
  description: string;
  maxPartySize: number;
  layout: string[];
  tileEvents: Record<string, MapTileEvent>;
  clearReward: {
    gold: number;
    items: InventoryEntry[];
  };
}

export type QuestRequirement =
  | {
      type: "craftItem";
      itemId: string;
      quantity: number;
    }
  | {
      type: "sellGold";
      amount: number;
    }
  | {
      type: "clearMap";
      mapId: string;
    };

export interface QuestReward {
  gold: number;
  items: InventoryEntry[];
  unlocksMapId?: string;
  unlocksRecipeIds?: string[];
}

export interface QuestDefinition {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  requirements: QuestRequirement[];
  rewards: QuestReward;
}

export interface ExplorationState {
  mapId: string;
  position: {
    x: number;
    y: number;
  };
  visitedTileKeys: string[];
}

export interface BattleUnitState extends CombatStats {
  unitId: string;
  name: string;
  icon: string;
  team: "player" | "enemy";
  sourceId: string;
  nextActionAt: number;
  currentHealth: number;
  rewardGold: number;
  rewardItems: InventoryEntry[];
}

export interface BattleState {
  mapId: string;
  encounterId: string;
  phase: BattlePhase;
  playerUnits: BattleUnitState[];
  enemyUnits: BattleUnitState[];
  activeUnitId: string | null;
  log: string[];
}

export interface QuestRuntimeState {
  status: "available" | "claimed";
  claimedAt?: string;
}

export interface LifetimeProgress {
  craftedCounts: Record<string, number>;
  soldGold: number;
  clearedMapIds: string[];
}

export interface GameState {
  version: 2;
  gold: number;
  inventory: Record<string, number>;
  showcaseInventory: Record<string, number>;
  adventurers: AdventurerState[];
  partyOrder: string[];
  unlockedMapIds: string[];
  unlockedRecipeIds: string[];
  currentMapId: string;
  exploration: ExplorationState;
  battle: BattleState | null;
  lifetime: LifetimeProgress;
  questStates: Record<string, QuestRuntimeState>;
  recentActivities: string[];
}

export interface DerivedAdventurerStats extends CombatStats {
  powerRating: number;
}
