import { gameContent } from "../content";
import type {
  AdventurerState,
  DerivedAdventurerStats,
  EquipmentSlot,
} from "./types";

type EquipmentStatKey = Exclude<keyof DerivedAdventurerStats, "powerRating">;

function readEquipmentBonus(
  adventurer: AdventurerState,
  slot: EquipmentSlot,
  stat: EquipmentStatKey,
): number {
  const itemId = adventurer.equipment[slot];

  if (!itemId) {
    return 0;
  }

  return gameContent.itemDefinitionsById[itemId].statBonuses?.[stat] ?? 0;
}

export function deriveAdventurerStats(
  adventurer: AdventurerState,
): DerivedAdventurerStats {
  const definition = gameContent.adventurersById[adventurer.definitionId];
  const levelOffset = adventurer.level - 1;

  const maxHealth =
    definition.baseStats.maxHealth +
    definition.growth.health * levelOffset +
    readEquipmentBonus(adventurer, "weapon", "maxHealth") +
    readEquipmentBonus(adventurer, "armor", "maxHealth") +
    readEquipmentBonus(adventurer, "accessory", "maxHealth");
  const attack =
    definition.baseStats.attack +
    definition.growth.attack * levelOffset +
    readEquipmentBonus(adventurer, "weapon", "attack") +
    readEquipmentBonus(adventurer, "armor", "attack") +
    readEquipmentBonus(adventurer, "accessory", "attack");
  const defense =
    definition.baseStats.defense +
    definition.growth.defense * levelOffset +
    readEquipmentBonus(adventurer, "weapon", "defense") +
    readEquipmentBonus(adventurer, "armor", "defense") +
    readEquipmentBonus(adventurer, "accessory", "defense");
  const speed =
    definition.baseStats.speed +
    definition.growth.speed * levelOffset +
    readEquipmentBonus(adventurer, "weapon", "speed") +
    readEquipmentBonus(adventurer, "armor", "speed") +
    readEquipmentBonus(adventurer, "accessory", "speed");

  return {
    maxHealth,
    attack,
    defense,
    speed,
    powerRating: maxHealth + attack * 3 + defense * 2 + speed * 2,
  };
}
