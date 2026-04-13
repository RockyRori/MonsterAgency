import {
  addInventoryEntries,
  hasInventory,
  removeInventoryEntries,
} from "./inventory";
import type { GameState, QuestDefinition, QuestRequirement } from "./types";

function requirementMet(
  state: GameState,
  requirement: QuestRequirement,
): boolean {
  if (requirement.type === "items") {
    return hasInventory(state.inventory, requirement.items);
  }

  return (state.mapProgress[requirement.mapId]?.wins ?? 0) >= requirement.wins;
}

export function isQuestClaimed(state: GameState, questId: string): boolean {
  return state.questStates[questId]?.status === "claimed";
}

export function canCompleteQuest(
  state: GameState,
  quest: QuestDefinition,
): boolean {
  if (isQuestClaimed(state, quest.id)) {
    return false;
  }

  return quest.requirements.every((requirement) =>
    requirementMet(state, requirement),
  );
}

export function completeQuest(
  state: GameState,
  quest: QuestDefinition,
  nowIso: string,
): GameState {
  const itemRequirements = quest.requirements.flatMap((requirement) =>
    requirement.type === "items" ? requirement.items : [],
  );
  const spentInventory = itemRequirements.length
    ? removeInventoryEntries(state.inventory, itemRequirements)
    : state.inventory;
  const rewardedInventory = addInventoryEntries(
    spentInventory,
    quest.rewards.items,
  );
  const unlockedMapIds = quest.rewards.unlocksMapId
    ? Array.from(new Set([...state.unlockedMapIds, quest.rewards.unlocksMapId]))
    : state.unlockedMapIds;

  return {
    ...state,
    inventory: rewardedInventory,
    gold: state.gold + quest.rewards.gold,
    unlockedMapIds,
    questStates: {
      ...state.questStates,
      [quest.id]: {
        status: "claimed",
        claimedAt: nowIso,
      },
    },
  };
}
