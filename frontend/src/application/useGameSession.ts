import { useEffect, useMemo, useState } from "react";
import { gameContent } from "../content";
import {
  createBattleState,
  getBattleRewards,
  performPlayerAttack,
} from "../domain/battle";
import {
  canCraftRecipe,
  craftRecipe,
  getSmithingPower,
} from "../domain/crafting";
import { createInitialGameState } from "../domain/create-game-state";
import {
  applyTileEventRewards,
  canMoveToTile,
  createExplorationState,
} from "../domain/exploration";
import {
  addInventoryEntries,
  removeInventoryEntries,
} from "../domain/inventory";
import {
  canCompleteQuest,
  completeQuest,
  isQuestClaimed,
} from "../domain/quests";
import {
  getAdventurerById,
  getInventoryEntries,
  getPartyMembers,
  getShowcaseEntries,
} from "../domain/selectors";
import {
  getCounterPower,
  returnShowcaseItem,
  runShopShift,
  stockShowcaseItem,
} from "../domain/shop";
import { deriveAdventurerStats } from "../domain/stats";
import type { EquipmentSlot, GameState } from "../domain/types";
import { clearGameState, loadGameState, saveGameState } from "../infra/storage";

interface BattleReport {
  title: string;
  subtitle: string;
  log: string[];
}

function pushActivity(state: GameState, message: string): GameState {
  return {
    ...state,
    recentActivities: [message, ...state.recentActivities].slice(0, 10),
  };
}

function hydrateState(): GameState {
  return loadGameState() ?? createInitialGameState();
}

export function useGameSession() {
  const [state, setState] = useState<GameState>(() => hydrateState());
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const currentMap = gameContent.mapsById[state.currentMapId];
  const smithingPower = getSmithingPower(state);
  const counterPower = getCounterPower(state);
  const inventoryEntries = getInventoryEntries(state);
  const showcaseEntries = getShowcaseEntries(state);
  const partyMembers = getPartyMembers(state);
  const partyIssues = useMemo(() => {
    const issues: string[] = [];

    if (state.partyOrder.length === 0) {
      issues.push("至少需要 1 名冒险者编入远征队。");
    }

    if (state.partyOrder.length > currentMap.maxPartySize) {
      issues.push(`当前区域最多允许 ${currentMap.maxPartySize} 人远征。`);
    }

    return issues;
  }, [currentMap.maxPartySize, state.partyOrder.length]);

  function assignAdventurer(
    instanceId: string,
    assignment: GameState["adventurers"][number]["assignment"],
  ) {
    setState((currentState) => {
      const alreadyInParty = currentState.partyOrder.includes(instanceId);

      if (
        assignment === "party" &&
        !alreadyInParty &&
        currentState.partyOrder.length >=
          gameContent.mapsById[currentState.currentMapId].maxPartySize
      ) {
        return currentState;
      }

      const nextPartyOrder =
        assignment === "party"
          ? alreadyInParty
            ? currentState.partyOrder
            : [...currentState.partyOrder, instanceId]
          : currentState.partyOrder.filter((id) => id !== instanceId);

      return pushActivity(
        {
          ...currentState,
          adventurers: currentState.adventurers.map((adventurer) =>
            adventurer.instanceId === instanceId
              ? { ...adventurer, assignment }
              : adventurer,
          ),
          partyOrder: nextPartyOrder,
        },
        "冒险者岗位已经重新分配，店内和远征队会按新分工运转。",
      );
    });
  }

  function equipItem(adventurerId: string, slot: EquipmentSlot, nextItemId: string) {
    setState((currentState) => {
      const adventurer = getAdventurerById(currentState, adventurerId);

      if (!adventurer) {
        return currentState;
      }

      const currentItemId = adventurer.equipment[slot];
      let nextInventory = { ...currentState.inventory };

      if (currentItemId) {
        nextInventory = addInventoryEntries(nextInventory, [
          { itemId: currentItemId, quantity: 1 },
        ]);
      }

      if (nextItemId) {
        if ((nextInventory[nextItemId] ?? 0) <= 0) {
          return currentState;
        }

        nextInventory = removeInventoryEntries(nextInventory, [
          { itemId: nextItemId, quantity: 1 },
        ]);
      }

      return {
        ...currentState,
        inventory: nextInventory,
        adventurers: currentState.adventurers.map((candidate) =>
          candidate.instanceId === adventurerId
            ? {
                ...candidate,
                equipment: {
                  ...candidate.equipment,
                  [slot]: nextItemId || undefined,
                },
              }
            : candidate,
        ),
      };
    });
  }

  function craft(recipeId: string) {
    const recipe = gameContent.recipeDefinitionsById[recipeId];

    if (!recipe || !canCraftRecipe(state, recipe)) {
      return;
    }

    setState((currentState) =>
      pushActivity(
        craftRecipe(currentState, recipe),
        `工坊完成了 ${recipe.name}，可用于装备、陈列或订单交付。`,
      ),
    );
  }

  function stockItem(itemId: string) {
    if ((state.inventory[itemId] ?? 0) <= 0) {
      return;
    }

    setState((currentState) =>
      pushActivity(
        stockShowcaseItem(currentState, itemId),
        `${gameContent.itemDefinitionsById[itemId].name} 已经摆上展柜。`,
      ),
    );
  }

  function unstockItem(itemId: string) {
    if ((state.showcaseInventory[itemId] ?? 0) <= 0) {
      return;
    }

    setState((currentState) =>
      pushActivity(
        returnShowcaseItem(currentState, itemId),
        `${gameContent.itemDefinitionsById[itemId].name} 已经从展柜撤回仓库。`,
      ),
    );
  }

  function runShopDay() {
    const result = runShopShift(state);
    const soldLabel =
      result.soldItems.length > 0
        ? result.soldItems
            .map(
              (entry) =>
                `${gameContent.itemDefinitionsById[entry.itemId].name} x${entry.quantity}`,
            )
            .join(" / ")
        : "没有商品成交";

    setState(
      pushActivity(
        result.state,
        `营业班次结束：${soldLabel}，共入账 ${result.goldEarned} 金币。`,
      ),
    );
  }

  function travelToMap(mapId: string) {
    if (!state.unlockedMapIds.includes(mapId)) {
      return;
    }

    setBattleReport(null);
    setState((currentState) => ({
      ...currentState,
      currentMapId: mapId,
      exploration: createExplorationState(mapId),
      battle: null,
    }));
  }

  function moveExplorer(deltaX: number, deltaY: number) {
    setState((currentState) => {
      if (currentState.battle) {
        return currentState;
      }

      const map = gameContent.mapsById[currentState.currentMapId];
      const nextX = currentState.exploration.position.x + deltaX;
      const nextY = currentState.exploration.position.y + deltaY;

      if (!canMoveToTile(map, nextX, nextY)) {
        return currentState;
      }

      const tileKey = `${nextX},${nextY}`;
      let nextState: GameState = {
        ...currentState,
        exploration: {
          ...currentState.exploration,
          position: { x: nextX, y: nextY },
          visitedTileKeys: currentState.exploration.visitedTileKeys.includes(tileKey)
            ? currentState.exploration.visitedTileKeys
            : [...currentState.exploration.visitedTileKeys, tileKey],
        },
      };

      if (!currentState.exploration.visitedTileKeys.includes(tileKey)) {
        const eventResult = applyTileEventRewards(nextState, tileKey);
        nextState = eventResult.state;

        if (eventResult.message) {
          nextState = pushActivity(nextState, eventResult.message);
        }

        if (eventResult.battleEncounterId) {
          nextState = {
            ...nextState,
            battle: createBattleState(nextState, eventResult.battleEncounterId),
          };
        }
      }

      return nextState;
    });
  }

  function attackTarget(targetEnemyId: string) {
    if (!state.battle) {
      return;
    }

    const resolvedBattle = performPlayerAttack(state.battle, targetEnemyId);

    if (resolvedBattle.phase === "victory") {
      const rewards = getBattleRewards(resolvedBattle);
      const nextState = pushActivity(
        {
          ...state,
          battle: null,
          inventory: addInventoryEntries(state.inventory, rewards.items),
          gold: state.gold + rewards.gold,
        },
        `远征胜利，带回 ${rewards.gold} 金币和 ${rewards.items.length} 类素材。`,
      );

      setState(nextState);
      setBattleReport({
        title: "战斗胜利",
        subtitle: "敌方被清空，远征收获已回流到店铺。",
        log: resolvedBattle.log,
      });
      return;
    }

    if (resolvedBattle.phase === "defeat") {
      setState(
        pushActivity(
          {
            ...state,
            battle: null,
          },
          "远征失败，本次没有带回额外战利品。",
        ),
      );
      setBattleReport({
        title: "战斗失利",
        subtitle: "队伍撤退回店，需要重新整备装备与分工。",
        log: resolvedBattle.log,
      });
      return;
    }

    setState({
      ...state,
      battle: resolvedBattle,
    });
  }

  function claimQuest(questId: string) {
    const quest = gameContent.questsById[questId];

    if (!quest || !canCompleteQuest(state, quest)) {
      return;
    }

    setState((currentState) =>
      pushActivity(
        completeQuest(currentState, quest, new Date().toISOString()),
        `完成任务《${quest.name}》，解锁了新的经营推进空间。`,
      ),
    );
  }

  function resetProgress() {
    clearGameState();
    setBattleReport(null);
    setState(createInitialGameState());
  }

  return {
    state,
    currentMap,
    smithingPower,
    counterPower,
    inventoryEntries,
    showcaseEntries,
    partyMembers,
    partyIssues,
    battleReport,
    roster: state.adventurers.map((adventurer) => ({
      adventurer,
      definition: gameContent.adventurersById[adventurer.definitionId],
      stats: deriveAdventurerStats(adventurer),
    })),
    recipes: gameContent.recipeDefinitions.filter((recipe) =>
      state.unlockedRecipeIds.includes(recipe.id),
    ),
    quests: gameContent.questDefinitions.map((quest) => ({
      quest,
      claimed: isQuestClaimed(state, quest.id),
      completable: canCompleteQuest(state, quest),
    })),
    travelToMap,
    moveExplorer,
    attackTarget,
    assignAdventurer,
    equipItem,
    craft,
    stockItem,
    unstockItem,
    runShopDay,
    claimQuest,
    resetProgress,
    dismissBattleReport: () => setBattleReport(null),
  };
}
