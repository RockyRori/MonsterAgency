export type Team = "player" | "enemy";

export interface BattleActor {
  uid: string;           // 对应 MonsterInstance.uid
  team: Team;
  name: string;

  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;

  tu: number;            // 当前时间值：越小越先行动
  alive: boolean;

  skills: string[];      // skillId
}

export interface SkillDef {
  id: string;
  name: string;
  tuCost: number;
  target: "singleEnemy" | "self";
  // MVP：只做伤害/自愈两类
  effect:
    | { kind: "damage"; power: number }   // damage = power * atk - def
    | { kind: "heal"; amount: number };
}

export interface BattleState {
  actors: BattleActor[];
  turn: number;
  log: string[];

  phase: "selectAction" | "animating" | "ended";
  activeActorUid: string | null;
  winner: Team | null;
}
