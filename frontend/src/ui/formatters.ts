import { gameContent } from "../content";
import type {
  InventoryEntry,
  MonsterInstance,
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

export function formatAssignment(monster: MonsterInstance): string {
  const type = monster.currentAssignment.type;

  if (type === "combat") {
    return `战斗 · ${monster.currentMapId}`;
  }

  if (type === "idle") {
    return `放置 · ${monster.currentMapId}`;
  }

  if (type === "store") {
    return "经营";
  }

  return "制作";
}

export function formatQuestRequirement(requirement: QuestRequirement): string {
  if (requirement.type === "items") {
    return formatInventoryEntries(requirement.items);
  }

  const map = gameContent.mapsById[requirement.mapId];
  return `${map.name} 胜利 ${requirement.wins} 次`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
