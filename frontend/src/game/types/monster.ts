export type Rarity = "N" | "R" | "SR" | "SSR";
export type Species = "Beast" | "Spirit" | "Demon" | "Dragon";

export interface MonsterTemplate {
  id: string;          // 模板ID，例如 "slime_001"
  dexNo: number;       // 图鉴编号
  name: string;
  species: Species;
  rarity: Rarity;

  // MVP：先做最小战斗属性
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number; // 速度影响初始 TU 或行动频率
  };

  // MVP：1个技能槽
  skills: string[]; // skillId 列表
}

export interface MonsterInstance {
  uid: string;        // 实例唯一ID（uuid）
  templateId: string;

  isShiny: boolean;
  level: number;
  exp: number;

  star: number;       // 普通星阶（MVP 先保留字段不做系统）
  shinyStar: number;  // 闪光星阶（MVP 先保留字段不做系统）

  // 战斗运行时属性（战斗开始时从模板+等级生成）
}
