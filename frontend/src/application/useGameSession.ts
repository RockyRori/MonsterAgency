import { useEffect, useRef, useState } from "react";
import { gameContent } from "../content";
import {
  buildMonsterInstance,
  createInitialGameState,
} from "../domain/create-game-state";
import {
  buildEncounterParty,
  createPlayerBattleParty,
  resolveBattle,
} from "../domain/battle";
import { canCraftRecipe, craftRecipe } from "../domain/crafting";
import { settleIdleProgress } from "../domain/idle";
import { addInventoryEntries } from "../domain/inventory";
import { validateActiveLineup } from "../domain/lineup";
import {
  canCompleteQuest,
  completeQuest,
  isQuestClaimed,
} from "../domain/quests";
import { getAssignmentPower, getInventoryEntries } from "../domain/selectors";
import { sellInventoryItem } from "../domain/store";
import type { GameState, IdleSettlementResult } from "../domain/types";
import { clearGameState, loadGameState, saveGameState } from "../infra/storage";

interface BattleReport {
  title: string;
  subtitle: string;
  log: string[];
}

interface HydratedSession {
  state: GameState;
  idleReport: IdleSettlementResult | null;
}

function getFarmingPowerByMap(state: GameState): Record<string, number> {
  const uniqueMapIds = new Set(
    state.monsters
      .filter((monster) => monster.currentAssignment.type === "idle")
      .map((monster) => monster.currentMapId),
  );

  return [...uniqueMapIds].reduce<Record<string, number>>((result, mapId) => {
    result[mapId] = getAssignmentPower(state, "idle", mapId);
    return result;
  }, {});
}

function pushActivity(state: GameState, message: string): GameState {
  return {
    ...state,
    recentActivities: [message, ...state.recentActivities].slice(0, 8),
  };
}

function hydrateSession(): HydratedSession {
  const stored = loadGameState();
  const baseState = stored ?? createInitialGameState();
  const idleReport = settleIdleProgress(
    baseState,
    new Date().toISOString(),
    gameContent.mapsById,
    getFarmingPowerByMap(baseState),
  );

  if (idleReport.settledTicks <= 0) {
    return {
      state: baseState,
      idleReport: null,
    };
  }

  return {
    state: pushActivity(
      idleReport.state,
      `放置结算完成，累计回收 ${idleReport.itemsCollected.length} 类素材。`,
    ),
    idleReport,
  };
}

function createInstanceId(templateId: string): string {
  return `${templateId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function useGameSession() {
  const hydratedRef = useRef<HydratedSession | null>(null);

  if (!hydratedRef.current) {
    hydratedRef.current = hydrateSession();
  }

  const [state, setState] = useState<GameState>(hydratedRef.current.state);
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
  const [idleReport, setIdleReport] = useState<IdleSettlementResult | null>(
    hydratedRef.current.idleReport,
  );

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const currentMap = gameContent.mapsById[state.currentMapId];
  const unlockedMaps = gameContent.mapDefinitions.filter((map) =>
    state.unlockedMapIds.includes(map.id),
  );
  const craftingPower = getAssignmentPower(state, "crafting");
  const storePower = getAssignmentPower(state, "store");
  const lineupValidation = validateActiveLineup(state, currentMap);

  function updateMonsterAssignment(
    instanceId: string,
    assignmentType: "combat" | "idle" | "store" | "crafting",
  ) {
    setState((currentState) => {
      const nextState = {
        ...currentState,
        monsters: currentState.monsters.map((monster) => {
          if (monster.instanceId !== instanceId) {
            return monster;
          }

          const template = gameContent.monsterTemplatesById[monster.templateId];

          if (assignmentType === "combat" || assignmentType === "idle") {
            if (!template.allowedMapIds.includes(currentState.currentMapId)) {
              return monster;
            }

            return {
              ...monster,
              currentAssignment: {
                type: assignmentType,
                mapId: currentState.currentMapId,
              },
              currentMapId: currentState.currentMapId,
            };
          }

          return {
            ...monster,
            currentAssignment: {
              type: assignmentType,
            },
          };
        }),
        activeLineup:
          assignmentType === "combat"
            ? currentState.activeLineup
            : currentState.activeLineup.filter((lineupId) => lineupId !== instanceId),
      };

      return pushActivity(nextState, "怪物岗位已调整，资源分工同步更新。");
    });
  }

  function toggleLineup(instanceId: string) {
    setState((currentState) => {
      const map = gameContent.mapsById[currentState.currentMapId];
      const exists = currentState.activeLineup.includes(instanceId);

      if (exists) {
        return {
          ...currentState,
          activeLineup: currentState.activeLineup.filter((id) => id !== instanceId),
        };
      }

      const monster = currentState.monsters.find(
        (candidate) => candidate.instanceId === instanceId,
      );

      if (!monster) {
        return currentState;
      }

      if (
        monster.currentAssignment.type !== "combat" ||
        monster.currentMapId !== currentState.currentMapId
      ) {
        return currentState;
      }

      const hasDuplicateTemplate = currentState.activeLineup
        .map((lineupId) =>
          currentState.monsters.find((candidate) => candidate.instanceId === lineupId),
        )
        .some((lineupMonster) => lineupMonster?.templateId === monster.templateId);

      if (
        hasDuplicateTemplate ||
        currentState.activeLineup.length >= map.deploymentLimit
      ) {
        return currentState;
      }

      return {
        ...currentState,
        activeLineup: [...currentState.activeLineup, instanceId],
      };
    });
  }

  function travelToMap(mapId: string) {
    if (!state.unlockedMapIds.includes(mapId)) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      currentMapId: mapId,
    }));
    setBattleReport(null);
  }

  function settleIdleNow() {
    const report = settleIdleProgress(
      state,
      new Date().toISOString(),
      gameContent.mapsById,
      getFarmingPowerByMap(state),
    );

    if (report.settledTicks <= 0) {
      setIdleReport({
        state,
        settledTicks: 0,
        elapsedHours: 0,
        itemsCollected: [],
      });
      return;
    }

    setState(
      pushActivity(
        report.state,
        `放置收益到账：${report.itemsCollected.length} 类素材进入仓库。`,
      ),
    );
    setIdleReport(report);
  }

  function runEncounter() {
    const validation = validateActiveLineup(state, currentMap);

    if (!validation.valid) {
      setBattleReport({
        title: "编队无效",
        subtitle: "先把当前地图的出战怪物调整好。",
        log: validation.issues,
      });
      return;
    }

    const encounter = buildEncounterParty(
      currentMap,
      Array.from({ length: 8 }, () => Math.random()),
    );
    const resolution = resolveBattle(
      createPlayerBattleParty(state, currentMap.id),
      encounter,
    );

    let nextState = state;
    let subtitle = `遭遇 ${encounter.map((enemy) => enemy.name).join("、")}`;

    if (resolution.winner === "player") {
      nextState = {
        ...nextState,
        inventory: addInventoryEntries(nextState.inventory, resolution.rewards.items),
        gold: nextState.gold + resolution.rewards.gold,
        mapProgress: {
          ...nextState.mapProgress,
          [currentMap.id]: {
            wins: (nextState.mapProgress[currentMap.id]?.wins ?? 0) + 1,
          },
        },
      };

      const captureCandidate = resolution.captureCandidates.find(
        (candidate) => Math.random() <= candidate.captureChance,
      );

      if (captureCandidate) {
        const isShiny = Math.random() <= 0.08;
        nextState = {
          ...nextState,
          monsters: [
            ...nextState.monsters,
            buildMonsterInstance({
              instanceId: createInstanceId(captureCandidate.templateId),
              templateId: captureCandidate.templateId,
              level: captureCandidate.level,
              isShiny,
              assignment: {
                type: "idle",
                mapId: currentMap.id,
              },
              currentMapId: currentMap.id,
            }),
          ],
        };
        subtitle += "，并额外成功收编了一只怪物。";
      }

      nextState = pushActivity(
        nextState,
        `探索 ${currentMap.name} 获胜，入账 ${resolution.rewards.gold} 金币。`,
      );
    } else {
      nextState = pushActivity(
        nextState,
        `探索 ${currentMap.name} 失利，事务所需要重新调整。`,
      );
    }

    setState(nextState);
    setBattleReport({
      title: resolution.winner === "player" ? "战斗胜利" : "战斗失利",
      subtitle,
      log: resolution.log,
    });
  }

  function craft(recipeId: string) {
    const recipe = gameContent.recipeDefinitionsById[recipeId];

    if (!recipe || !canCraftRecipe(state, recipe)) {
      return;
    }

    const result = craftRecipe(state, recipe, craftingPower);

    setState(
      pushActivity(
        result.state,
        `${recipe.name} 完成，产出 ${result.producedQuantity} 件 ${gameContent.itemDefinitionsById[recipe.output.itemId].name}。`,
      ),
    );
  }

  function sell(itemId: string, quantity: number) {
    const item = gameContent.itemDefinitionsById[itemId];

    if (!item || (state.inventory[itemId] ?? 0) < quantity) {
      return;
    }

    const result = sellInventoryItem(
      state,
      itemId,
      quantity,
      item.baseValue,
      storePower,
    );

    setState(
      pushActivity(
        result.state,
        `出售 ${item.name} x${quantity}，获得 ${result.goldEarned} 金币。`,
      ),
    );
  }

  function claimQuest(questId: string) {
    const quest = gameContent.questsById[questId];

    if (!quest || !canCompleteQuest(state, quest)) {
      return;
    }

    const nextState = completeQuest(state, quest, new Date().toISOString());

    setState(
      pushActivity(
        nextState,
        `完成任务《${quest.name}》，获得 ${quest.rewards.gold} 金币。`,
      ),
    );
  }

  function resetProgress() {
    clearGameState();
    const freshState = createInitialGameState();
    setBattleReport(null);
    setIdleReport(null);
    setState(freshState);
  }

  return {
    state,
    currentMap,
    unlockedMaps,
    craftingPower,
    storePower,
    lineupValidation,
    battleReport,
    idleReport,
    inventoryEntries: getInventoryEntries(state),
    roster: state.monsters.map((monster) => ({
      monster,
      template: gameContent.monsterTemplatesById[monster.templateId],
    })),
    quests: gameContent.questDefinitions.map((quest) => ({
      quest,
      claimed: isQuestClaimed(state, quest.id),
      completable: canCompleteQuest(state, quest),
    })),
    travelToMap,
    updateMonsterAssignment,
    toggleLineup,
    settleIdleNow,
    runEncounter,
    craft,
    sell,
    claimQuest,
    resetProgress,
    dismissBattleReport: () => setBattleReport(null),
    dismissIdleReport: () => setIdleReport(null),
  };
}
