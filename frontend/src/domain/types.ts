export type Rarity = "common" | "uncommon" | "rare";
export type AssignmentType = "combat" | "idle" | "store" | "crafting";
export type ItemKind = "material" | "consumable" | "trade-good";
export type QuestType = "main" | "side";

export interface StatBlock {
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface LaborProfile {
  farming: number;
  crafting: number;
  store: number;
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  species: string;
  rarity: Rarity;
  tags: string[];
  baseStats: StatBlock;
  growthCurveId: string;
  laborProfile: LaborProfile;
  skillPool: string[];
  traitPool: string[];
  allowedMapIds: string[];
  captureRate: number;
  visuals: {
    emoji: string;
    accent: string;
  };
}

export interface MonsterAssignment {
  type: AssignmentType;
  mapId?: string;
}

export interface MonsterInstance {
  instanceId: string;
  templateId: string;
  isShiny: boolean;
  level: number;
  exp: number;
  starRank: number;
  shinyStarRank: number;
  skills: string[];
  equips: string[];
  traits: string[];
  currentAssignment: MonsterAssignment;
  currentMapId: string;
  lockState: "available" | "locked";
}

export interface ItemDefinition {
  id: string;
  name: string;
  kind: ItemKind;
  description: string;
  baseValue: number;
}

export interface RecipeDefinition {
  id: string;
  name: string;
  description: string;
  inputs: InventoryEntry[];
  output: InventoryEntry;
  craftingPowerThreshold?: number;
}

export interface EncounterDefinition {
  monsterTemplateId: string;
  weight: number;
  levelRange: {
    min: number;
    max: number;
  };
  loot: InventoryEntry[];
  goldReward: number;
  captureChanceModifier: number;
}

export interface MapDefinition {
  id: string;
  worldId: string;
  name: string;
  theme: string;
  description: string;
  difficulty: number;
  deploymentLimit: number;
  encounterSize: {
    min: number;
    max: number;
  };
  tileData: string[];
  collisionData: string[];
  encounterPool: EncounterDefinition[];
  eventPoints: string[];
  idleDropTable: InventoryEntry[];
  unlockCondition?: {
    type: "mapWins";
    mapId: string;
    wins: number;
  };
}

export type QuestRequirement =
  | {
      type: "items";
      items: InventoryEntry[];
    }
  | {
      type: "mapWins";
      mapId: string;
      wins: number;
    };

export interface QuestReward {
  gold: number;
  items: InventoryEntry[];
  unlocksMapId?: string;
}

export interface QuestDefinition {
  id: string;
  type: QuestType;
  name: string;
  description: string;
  requirements: QuestRequirement[];
  rewards: QuestReward;
}

export interface MapProgress {
  wins: number;
}

export interface QuestRuntimeState {
  status: "available" | "claimed";
  claimedAt?: string;
}

export interface GameState {
  version: 1;
  currentMapId: string;
  unlockedMapIds: string[];
  inventory: Record<string, number>;
  gold: number;
  monsters: MonsterInstance[];
  activeLineup: string[];
  mapProgress: Record<string, MapProgress>;
  questStates: Record<string, QuestRuntimeState>;
  time: {
    lastIdleSettlementAt: string;
  };
  recentActivities: string[];
}

export interface DerivedMonsterStats extends StatBlock {
  battlePower: number;
}

export interface BattleUnit {
  unitId: string;
  name: string;
  templateId: string;
  icon: string;
  level: number;
  maxHealth: number;
  currentHealth: number;
  attack: number;
  defense: number;
  speed: number;
  nextActionAt: number;
  loot: InventoryEntry[];
  goldReward: number;
  captureChance: number;
}

export interface BattleRewards {
  gold: number;
  items: InventoryEntry[];
}

export interface CaptureCandidate {
  templateId: string;
  level: number;
  captureChance: number;
}

export interface BattleResolution {
  winner: "player" | "enemy";
  log: string[];
  rewards: BattleRewards;
  survivingPlayerUnits: number;
  captureCandidates: CaptureCandidate[];
}

export interface IdleSettlementResult {
  state: GameState;
  settledTicks: number;
  elapsedHours: number;
  itemsCollected: InventoryEntry[];
}
