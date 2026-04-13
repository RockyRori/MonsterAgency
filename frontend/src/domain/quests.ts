import { addInventoryEntries } from "./inventory";
import type { GameState, QuestDefinition, QuestRequirement } from "./types";

function requirementMet(state: GameState, requirement: QuestRequirement): boolean {
  if (requirement.type === "craftItem") {
    return (state.lifetime.craftedCounts[requirement.itemId] ?? 0) >= requirement.quantity;
  }

  if (requirement.type === "sellGold") {
    return state.lifetime.soldGold >= requirement.amount;
  }

  return state.lifetime.clearedMapIds.includes(requirement.mapId);
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
  const rewardedInventory = addInventoryEntries(state.inventory, quest.rewards.items);
  const unlockedMapIds = quest.rewards.unlocksMapId
    ? Array.from(new Set([...state.unlockedMapIds, quest.rewards.unlocksMapId]))
    : state.unlockedMapIds;
  const unlockedRecipeIds = quest.rewards.unlocksRecipeIds
    ? Array.from(new Set([...state.unlockedRecipeIds, ...quest.rewards.unlocksRecipeIds]))
    : state.unlockedRecipeIds;

  return {
    ...state,
    inventory: rewardedInventory,
    gold: state.gold + quest.rewards.gold,
    unlockedMapIds,
    unlockedRecipeIds,
    questStates: {
      ...state.questStates,
      [quest.id]: {
        status: "claimed",
        claimedAt: nowIso,
      },
    },
  };
}
