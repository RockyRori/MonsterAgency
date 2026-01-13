import { type MonsterInstance } from "./types/monster";
import { type WorldMap } from "./types/map";
import { movePlayerIfPossible } from "./systems/collision";
import { encounterAtPlayer } from "./systems/encounter";

export type Mode = "explore" | "bag" | "battle";

export interface GameState {
  mode: Mode;

  world: WorldMap;
  player: {
    pos: { x: number; y: number };
    party: string[]; // MonsterInstance.uid
  };

  monsters: Record<string, MonsterInstance>;
  monsterUids: string[];

  // MVP：遭遇弹窗
  pendingEncounterId: string | null;

  // 战斗后面再接
  battle: null;

  ui: {
    selectedMonsterUid: string | null;
  };
}

export type Action =
  | { type: "MOVE"; dx: number; dy: number }
  | { type: "OPEN_BAG" }
  | { type: "CLOSE_BAG" }
  | { type: "ENCOUNTER_FOUND"; encounterId: string }
  | { type: "ENCOUNTER_CLOSE" }
  | { type: "CAPTURE_SUCCESS"; encounterId: string; monster: MonsterInstance }
  | { type: "START_BATTLE"; encounterId: string }; // MVP 先占位

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "OPEN_BAG":
      return { ...state, mode: "bag" };

    case "CLOSE_BAG":
      return { ...state, mode: "explore" };

    case "MOVE": {
      if (state.mode !== "explore") return state;
      if (state.pendingEncounterId) return state; // 弹窗期间不移动

      const moved = movePlayerIfPossible(state, action.dx, action.dy);

      // 位置没变就别检测了
      if (moved === state) return state;

      const encId = encounterAtPlayer(moved);
      if (encId) {
        return { ...moved, pendingEncounterId: encId };
      }
      return moved;
    }

    case "ENCOUNTER_FOUND":
      return { ...state, pendingEncounterId: action.encounterId };

    case "ENCOUNTER_CLOSE":
      return { ...state, pendingEncounterId: null };

    case "CAPTURE_SUCCESS": {
      // 1) 遭遇标记为已捕捉
      const encounters = state.world.encounters.map((e) =>
        e.id === action.encounterId ? { ...e, defeatedOrCaptured: true } : e
      );

      // 2) 加进背包
      const m = action.monster;

      return {
        ...state,
        pendingEncounterId: null,
        world: { ...state.world, encounters },
        monsters: { ...state.monsters, [m.uid]: m },
        monsterUids: [...state.monsterUids, m.uid],
        ui: { ...state.ui, selectedMonsterUid: state.ui.selectedMonsterUid ?? m.uid },
      };
    }

    case "START_BATTLE":
      // MVP：先占位，后面接 battle state
      return { ...state, pendingEncounterId: null, mode: "battle" };

    default:
      return state;
  }
}
