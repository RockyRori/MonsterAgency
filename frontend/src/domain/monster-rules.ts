import type {
  DerivedMonsterStats,
  MonsterInstance,
  MonsterTemplate,
} from "./types";

export function deriveMonsterStats(
  instance: MonsterInstance,
  template: MonsterTemplate,
): DerivedMonsterStats {
  const levelFactor = 1 + (instance.level - 1) * 0.12;
  const starFactor = 1 + instance.starRank * 0.08;
  const shinyBonus = instance.isShiny ? 1.06 : 1;

  const maxHealth = Math.round(
    template.baseStats.maxHealth * levelFactor * starFactor * shinyBonus,
  );
  const attack = Math.round(
    template.baseStats.attack * levelFactor * starFactor * shinyBonus,
  );
  const defense = Math.round(
    template.baseStats.defense * levelFactor * starFactor * shinyBonus,
  );
  const speed = Math.max(
    1,
    Math.round(template.baseStats.speed * (1 + (instance.level - 1) * 0.04)),
  );

  return {
    maxHealth,
    attack,
    defense,
    speed,
    battlePower: maxHealth + attack * 3 + defense * 2 + speed * 2,
  };
}
