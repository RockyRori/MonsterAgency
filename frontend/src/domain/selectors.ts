import { gameContent } from "../content";
import type {
  AssignmentType,
  GameState,
  InventoryEntry,
  MonsterInstance,
} from "./types";

export function getMonsterTemplateByInstance(instance: MonsterInstance) {
  return gameContent.monsterTemplatesById[instance.templateId];
}

export function getMonsterById(state: GameState, instanceId: string) {
  return state.monsters.find((monster) => monster.instanceId === instanceId);
}

export function getAssignmentPower(
  state: GameState,
  assignmentType: AssignmentType,
  mapId?: string,
): number {
  return state.monsters
    .filter((monster) => monster.currentAssignment.type === assignmentType)
    .filter((monster) => {
      if (assignmentType === "combat" || assignmentType === "idle") {
        return monster.currentAssignment.mapId === mapId;
      }

      return true;
    })
    .reduce((total, monster) => {
      const template = getMonsterTemplateByInstance(monster);

      if (assignmentType === "idle") {
        return total + template.laborProfile.farming;
      }

      if (assignmentType === "crafting") {
        return total + template.laborProfile.crafting;
      }

      if (assignmentType === "store") {
        return total + template.laborProfile.store;
      }

      return total;
    }, 0);
}

export function getInventoryEntries(state: GameState): InventoryEntry[] {
  return Object.entries(state.inventory)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ itemId, quantity }))
    .sort((left, right) => right.quantity - left.quantity);
}
