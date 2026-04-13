import { gameContent } from "../content";
import { addInventoryEntries } from "./inventory";
import type { ExplorationState, GameState, MapDefinition } from "./types";

export function findStartPosition(map: MapDefinition) {
  for (let y = 0; y < map.layout.length; y += 1) {
    const x = map.layout[y].indexOf("S");

    if (x >= 0) {
      return { x, y };
    }
  }

  throw new Error(`Map ${map.id} does not define a start tile.`);
}

export function createExplorationState(mapId: string): ExplorationState {
  const map = gameContent.mapsById[mapId];
  const start = findStartPosition(map);

  return {
    mapId,
    position: start,
    visitedTileKeys: [`${start.x},${start.y}`],
  };
}

export function canMoveToTile(
  map: MapDefinition,
  x: number,
  y: number,
): boolean {
  if (y < 0 || y >= map.layout.length) {
    return false;
  }

  if (x < 0 || x >= map.layout[y].length) {
    return false;
  }

  return map.layout[y][x] !== "#";
}

export function applyTileEventRewards(
  state: GameState,
  tileKey: string,
): {
  state: GameState;
  message?: string;
  battleEncounterId?: string;
  clearedMap?: boolean;
} {
  const map = gameContent.mapsById[state.exploration.mapId];
  const event = map.tileEvents[tileKey];

  if (!event) {
    return { state };
  }

  if (event.type === "resource") {
    return {
      state: {
        ...state,
        inventory: addInventoryEntries(state.inventory, event.rewards),
      },
      message: event.message,
    };
  }

  if (event.type === "treasure") {
    return {
      state: {
        ...state,
        gold: state.gold + event.gold,
      },
      message: event.message,
    };
  }

  if (event.type === "battle") {
    return {
      state,
      battleEncounterId: event.encounterId,
      message: event.message,
    };
  }

  return {
    state: {
      ...state,
      gold: state.gold + map.clearReward.gold,
      inventory: addInventoryEntries(state.inventory, map.clearReward.items),
      lifetime: {
        ...state.lifetime,
        clearedMapIds: Array.from(
          new Set([...state.lifetime.clearedMapIds, map.id]),
        ),
      },
    },
    message: event.message,
    clearedMap: true,
  };
}
