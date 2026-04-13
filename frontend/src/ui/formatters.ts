import { gameContent } from "../content";
import type {
  InventoryEntry,
  QuestRequirement,
} from "../domain/types";

export function formatInventoryEntries(entries: InventoryEntry[]): string {
  if (entries.length === 0) {
    return "无";
  }

  return entries
    .map((entry) => {
      const item = gameContent.itemDefinitionsById[entry.itemId];
      return `${item.name} x${entry.quantity}`;
    })
    .join(" / ");
}

export function formatQuestRequirement(requirement: QuestRequirement): string {
  if (requirement.type === "craftItem") {
    return `${gameContent.itemDefinitionsById[requirement.itemId].name} x${requirement.quantity}`;
  }

  if (requirement.type === "sellGold") {
    return `累计营业额 ${requirement.amount}`;
  }

  return `${gameContent.mapsById[requirement.mapId].name} 通关`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
