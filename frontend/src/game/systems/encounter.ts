import { type GameState } from "../store";

export function encounterAtPlayer(state: GameState): string | null {
  const { x, y } = state.player.pos;
  const found = state.world.encounters.find(
    (e) => !e.defeatedOrCaptured && e.pos.x === x && e.pos.y === y
  );
  return found ? found.id : null;
}

export function getEncounterById(state: GameState, encounterId: string) {
  return state.world.encounters.find((e) => e.id === encounterId) ?? null;
}
