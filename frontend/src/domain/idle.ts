import { addInventoryEntries, mergeInventoryEntries } from "./inventory";
import type {
  GameState,
  IdleSettlementResult,
  InventoryEntry,
  MapDefinition,
} from "./types";

const MAX_IDLE_MS = 8 * 60 * 60 * 1000;
const TICK_MS = 30 * 60 * 1000;

function addMilliseconds(isoString: string, milliseconds: number): string {
  return new Date(new Date(isoString).getTime() + milliseconds).toISOString();
}

export function settleIdleProgress(
  state: GameState,
  nowIso: string,
  mapsById: Record<string, MapDefinition>,
  farmingPowerByMap: Record<string, number>,
): IdleSettlementResult {
  const elapsedMs =
    new Date(nowIso).getTime() -
    new Date(state.time.lastIdleSettlementAt).getTime();
  const cappedMs = Math.min(elapsedMs, MAX_IDLE_MS);
  const settledTicks = Math.floor(cappedMs / TICK_MS);

  if (settledTicks <= 0) {
    return {
      state,
      settledTicks: 0,
      elapsedHours: 0,
      itemsCollected: [],
    };
  }

  const itemsCollected = mergeInventoryEntries(
    Object.entries(farmingPowerByMap).flatMap(([mapId, farmingPower]) => {
      if (farmingPower <= 0) {
        return [];
      }

      const map = mapsById[mapId];
      const yieldMultiplier = Math.max(1, Math.floor(farmingPower / 4));

      return map.idleDropTable.map((entry): InventoryEntry => ({
        itemId: entry.itemId,
        quantity: entry.quantity * settledTicks * yieldMultiplier,
      }));
    }),
  );

  return {
    state: {
      ...state,
      inventory: addInventoryEntries(state.inventory, itemsCollected),
      time: {
        lastIdleSettlementAt:
          elapsedMs > MAX_IDLE_MS
            ? nowIso
            : addMilliseconds(
                state.time.lastIdleSettlementAt,
                settledTicks * TICK_MS,
              ),
      },
    },
    settledTicks,
    elapsedHours: (settledTicks * TICK_MS) / (60 * 60 * 1000),
    itemsCollected,
  };
}
