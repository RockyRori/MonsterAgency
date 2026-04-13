import { itemDefinitions, recipeDefinitions } from "./items";
import { mapDefinitions } from "./maps";
import { monsterTemplates } from "./monsters";
import { questDefinitions } from "./quests";

export const gameContent = {
  monsterTemplates,
  monsterTemplatesById: Object.fromEntries(
    monsterTemplates.map((template) => [template.id, template]),
  ),
  itemDefinitions,
  itemDefinitionsById: Object.fromEntries(
    itemDefinitions.map((item) => [item.id, item]),
  ),
  recipeDefinitions,
  recipeDefinitionsById: Object.fromEntries(
    recipeDefinitions.map((recipe) => [recipe.id, recipe]),
  ),
  mapDefinitions,
  mapsById: Object.fromEntries(mapDefinitions.map((map) => [map.id, map])),
  questDefinitions,
  questsById: Object.fromEntries(
    questDefinitions.map((quest) => [quest.id, quest]),
  ),
};
