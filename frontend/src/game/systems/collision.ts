import {type GameState } from "../store";

function inBounds(state: GameState, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < state.world.map.width && y < state.world.map.height;
}

function tileIdAt(state: GameState, x: number, y: number): number {
  return state.world.map.tiles[y * state.world.map.width + x];
}

export function canMoveTo(state: GameState, x: number, y: number): boolean {
  if (!inBounds(state, x, y)) return false;
  const id = tileIdAt(state, x, y);
  if (state.world.map.solid.has(id)) return false;
  return true;
}

export function movePlayerIfPossible(state: GameState, dx: number, dy: number): GameState {
  const nx = state.player.pos.x + dx;
  const ny = state.player.pos.y + dy;

  if (!canMoveTo(state, nx, ny)) return state;

  return {
    ...state,
    player: {
      ...state.player,
      pos: { x: nx, y: ny },
    },
  };
}
