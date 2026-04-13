import { gameContent } from "../content";
import type { GameState, MapDefinition } from "./types";

export interface LineupValidation {
  valid: boolean;
  issues: string[];
}

export function validateActiveLineup(
  state: GameState,
  map: MapDefinition,
): LineupValidation {
  const issues: string[] = [];
  const lineup = state.activeLineup
    .map((instanceId) =>
      state.monsters.find((monster) => monster.instanceId === instanceId),
    )
    .filter((monster) => Boolean(monster));

  if (lineup.length === 0) {
    issues.push("至少需要 1 只怪物进入当前编队。");
  }

  if (lineup.length > map.deploymentLimit) {
    issues.push(`当前地图最多允许 ${map.deploymentLimit} 只怪物出战。`);
  }

  const templateIds = new Set<string>();

  lineup.forEach((monster) => {
    if (!monster) {
      return;
    }

    if (monster.currentAssignment.type !== "combat") {
      issues.push("编队中的怪物必须先切换为战斗岗位。");
    }

    if (monster.currentMapId !== map.id) {
      issues.push("编队中的怪物必须驻扎在当前地图。");
    }

    const template = gameContent.monsterTemplatesById[monster.templateId];

    if (!template.allowedMapIds.includes(map.id)) {
      issues.push(`${template.name} 不能在当前地图出战。`);
    }

    if (templateIds.has(monster.templateId)) {
      issues.push("同一种怪物模板不能在同一编队里重复上阵。");
    }

    templateIds.add(monster.templateId);
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
