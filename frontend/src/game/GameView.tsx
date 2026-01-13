import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { reducer, type GameState } from "./store";
import { worldMap1 } from "./data/map1";
import { createMonsterInstance } from "./systems/capture";
import { EncounterModal } from "./ui/EncounterModal";

export function GameView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const initialState: GameState = useMemo(() => {
    const starter = createMonsterInstance("slime_001", false);
    return {
      mode: "explore",
      world: worldMap1,
      player: { pos: { ...worldMap1.playerSpawn }, party: [starter.uid] },
      monsters: { [starter.uid]: starter },
      monsterUids: [starter.uid],
      pendingEncounterId: null,
      battle: null,
      ui: { selectedMonsterUid: starter.uid },
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initialState);

  // 输入：方向键/WASD，B 打开背包（背包 UI 下一步做，这里先占位）
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (state.mode === "battle") return;

      if (e.key === "b" || e.key === "B") {
        dispatch({ type: state.mode === "bag" ? "CLOSE_BAG" : "OPEN_BAG" });
        return;
      }

      if (state.mode !== "explore") return;

      const dir =
        e.key === "ArrowUp" || e.key === "w" ? { dx: 0, dy: -1 } :
        e.key === "ArrowDown" || e.key === "s" ? { dx: 0, dy: 1 } :
        e.key === "ArrowLeft" || e.key === "a" ? { dx: -1, dy: 0 } :
        e.key === "ArrowRight" || e.key === "d" ? { dx: 1, dy: 0 } :
        null;

      if (!dir) return;

      dispatch({ type: "MOVE", dx: dir.dx, dy: dir.dy });
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.mode, state.pendingEncounterId]);

  // 渲染：用色块画 tile、玩家、遭遇妖兽
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { tileSize } = state.world;
    canvas.width = state.world.map.width * tileSize;
    canvas.height = state.world.map.height * tileSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // tiles
    for (let y = 0; y < state.world.map.height; y++) {
      for (let x = 0; x < state.world.map.width; x++) {
        const id = state.world.map.tiles[y * state.world.map.width + x];
        ctx.fillStyle = id === 1 ? "#2b2b2b" : "#9bdc88";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // encounters
    for (const e of state.world.encounters) {
      if (e.defeatedOrCaptured) continue;
      ctx.fillStyle = "#ffcc00";
      ctx.fillRect(
        e.pos.x * tileSize + 6,
        e.pos.y * tileSize + 6,
        tileSize - 12,
        tileSize - 12
      );
    }

    // player
    ctx.fillStyle = "#1e90ff";
    ctx.fillRect(
      state.player.pos.x * tileSize + 4,
      state.player.pos.y * tileSize + 4,
      tileSize - 8,
      tileSize - 8
    );
  }, [state]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas ref={canvasRef} style={{ border: "1px solid #333" }} />

      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
        移动：方向键/WASD　背包：B（占位）　
        背包数量：{state.monsterUids.length}
      </div>

      <EncounterModal state={state} dispatch={dispatch} />

      {state.mode === "battle" && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          战斗模式（占位）：下一步接入时间轴战斗 UI/引擎。
        </div>
      )}

      {state.mode === "bag" && (
        <div style={{ marginTop: 8, fontSize: 12 }}>
          背包 UI（占位）：下一步做列表 + 详情。
        </div>
      )}
    </div>
  );
}
