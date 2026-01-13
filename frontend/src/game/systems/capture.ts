import { v4 as uuid } from "uuid";
import {type  MonsterInstance } from "../types/monster";

export function createMonsterInstance(templateId: string, isShiny: boolean): MonsterInstance {
  return {
    uid: uuid(),
    templateId,
    isShiny,
    level: 1,
    exp: 0,
    star: 0,
    shinyStar: 0,
  };
}
