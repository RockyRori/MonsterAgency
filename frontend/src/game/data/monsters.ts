import {type MonsterTemplate } from "../types/monster";

export const MONSTERS: Record<string, MonsterTemplate> = {
  slime_001: {
    id: "slime_001",
    dexNo: 1,
    name: "史莱姆",
    species: "Spirit",
    rarity: "N",
    baseStats: { hp: 30, atk: 8, def: 3, spd: 10 },
    skills: ["skill_slime_bump"],
  },
  wolf_001: {
    id: "wolf_001",
    dexNo: 2,
    name: "野狼",
    species: "Beast",
    rarity: "R",
    baseStats: { hp: 40, atk: 10, def: 4, spd: 12 },
    skills: ["skill_wolf_bite"],
  },
};
