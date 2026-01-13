import { type WorldMap } from "../types/map";

const W = 16;
const H = 12;

// 0 可走，1 墙
const tiles = new Array(W * H).fill(0);

// 边框墙
for (let x = 0; x < W; x++) {
  tiles[x] = 1;
  tiles[(H - 1) * W + x] = 1;
}
for (let y = 0; y < H; y++) {
  tiles[y * W] = 1;
  tiles[y * W + (W - 1)] = 1;
}

// 简单“建筑块”
for (let y = 4; y <= 6; y++) {
  for (let x = 6; x <= 8; x++) {
    tiles[y * W + x] = 1;
  }
}

export const worldMap1: WorldMap = {
  id: "world1_map1",
  name: "第一章·新手镇",
  tileSize: 32,
  playerSpawn: { x: 2, y: 2 },
  map: {
    width: W,
    height: H,
    tiles,
    solid: new Set([1]),
  },
  encounters: [
    { id: "enc_1", pos: { x: 10, y: 3 }, templateId: "wolf_001", defeatedOrCaptured: false },
    { id: "enc_2", pos: { x: 3, y: 8 }, templateId: "slime_001", defeatedOrCaptured: false },
  ],
};
