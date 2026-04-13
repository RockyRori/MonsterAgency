# Project Context

## 1. Project identity

- Working name: `Monster Agency`
- Target reference: `Weapon Shop Fantasy` style shop/crafting/progression loop
- Combat and exploration reference: `Neo Monsters` style grid exploration + timeline manual battle
- Platform: web frontend first, single-player, local save is acceptable
- Product direction: build a clean, data-driven shop RPG that is fun to replay with friends, not a live-service product

This repository is still a from-scratch rebuild.
The old monster-management direction is no longer the source of truth.
From this task onward, the project should be treated as a weapon shop RPG with manual expedition battles.

---

## 2. Core fantasy

The player runs a fantasy weapon shop.

Daily play should feel like this:

1. hire or manage a small team of adventurers / staff
2. forge weapons and armor from gathered materials
3. equip the expedition party with crafted gear
4. place crafted goods on display for customers
5. send the party into a grid-based map
6. move tile by tile, trigger events, and fight enemies in manual timeline battles
7. bring materials and gold back to the shop
8. unlock better recipes, districts, staff, and production loops

The store is the main identity.
Exploration and battle exist to feed the store, not replace it.

---

## 3. Primary gameplay loop

The intended macro loop is:

1. Accept shop goals, requests, or progression quests
2. Forge equipment from current recipes
3. Choose whether to:
   - equip the party
   - stock the showcase for customers
   - save the item for a quest or future craft chain
4. Run a shop shift to sell stocked goods
5. Enter an expedition map
6. Walk on a grid, collect nodes, and trigger encounters
7. Win manual timeline battles for materials, gold, and map progress
8. Return to town and reinvest into better crafting and stronger gear

Design rule: every major feature should tighten this loop.

---

## 4. Product pillars

### Pillar A: Shop first
The player's identity is a weapons merchant, not a monster collector.

### Pillar B: Crafted gear has multiple destinations
Every forged item should have at least one of these uses:
- equip on a party member
- stock for shop sale
- fulfill a quest / commission
- serve as recipe progression or material conversion

### Pillar C: Adventurers are dual-purpose assets
A party member should matter both in town and in expeditions.
Examples:
- smithing support
- counter sales
- scouting / battle

### Pillar D: Exploration feeds the workshop
Map exploration should return materials, progression keys, and new pressure for crafting decisions.

### Pillar E: Data-driven expansion
Adding a new staff member, equipment piece, recipe, district, enemy, or encounter should mostly be a data change.

---

## 5. Current target game structure

## 5.1 Adventurer / Staff System
The main controllable units are adventurers who can work in town and fight in expeditions.

### Adventurer definition (`AdventurerDefinition`)
Static content data.

Suggested fields:
- `id`
- `name`
- `title`
- `role`
- `baseStats`
- `growth`
- `utilityProfile`
- `startingEquipmentIds`
- `visuals`

### Adventurer state (`AdventurerState`)
Runtime player-owned state.

Suggested fields:
- `instanceId`
- `definitionId`
- `level`
- `exp`
- `assignment`
- `equipment`
- `bondLevel`
- `unlockState`

### Assignment philosophy
Each adventurer should be assignable to a clear town or field role:
- `party`
- `smithy`
- `counter`
- `rest`

The same person should not provide full value in every lane at once.

---

## 5.2 Item / Equipment System
The main item categories should be:

- raw materials
- crafted weapons
- crafted armor
- crafted accessories
- occasional utility consumables

### Equipment expectations
Equipment should:
- materially change expedition stats
- also act as shop inventory
- be unlocked gradually through progression

### Inventory separation
Keep these concepts separate:
- static item definition
- inventory quantity
- currently equipped item on an adventurer
- currently stocked item in the showcase

---

## 5.3 Crafting / Smithy System
Crafting is the backbone of the game.

It should:
- consume materials from expeditions
- output equipment and goods
- care about smithing strength or support quality
- unlock stronger equipment over time

The first implementation may use simple formulas, but the interfaces should stay extensible.

---

## 5.4 Shop / Sales System
The shop is not just a sell button.

Key ideas:
- the player chooses what to stock
- stocked gear converts to gold through a shop shift
- better counter staff should improve throughput or margin
- quests and customer demand should pull specific item categories

This system is one of the most important differences from a normal RPG inventory screen.

---

## 5.5 Expedition Map System
Exploration should be map-based and tile-based.

### Map expectations
Each district / map should define:
- `id`
- `name`
- `theme`
- `layout`
- `tileEvents`
- `encounterPool`
- `resourceNodes`
- `clearReward`
- `unlockCondition`

### Exploration behavior
The player should:
- enter a map with a chosen party
- move tile by tile
- only step to adjacent valid tiles
- trigger resources, treasure, encounters, and exits

This is the part inspired by `Neo Monsters`, but applied to a weapon shop RPG.

---

## 5.6 Combat System
Combat should be manual timeline battle, not auto-resolve as the long-term target.

### Reference direction
- each unit acts according to a time value / speed
- the next actor is visible and deterministic
- player units wait for manual input on their turn
- enemies can act automatically

### Scope expectations
The first implementation can begin with:
- normal attack
- manual target selection
- simple enemy AI

Later it can grow into:
- skills
- turn manipulation
- status effects
- formation or threat rules

Combat logic should remain UI-independent and serializable.

---

## 5.7 Quest / Progression System
The project should support:

### Main progression
- unlock recipes
- unlock districts
- teach the loop of forge -> stock -> explore -> return

### Shop requests / side quests
- request specific crafted items
- reward gold, recipes, or progression items
- reinforce the store side of the loop

---

## 6. System priority

### Tier 1 core systems
Build these first:
1. item / equipment system
2. crafting / smithy system
3. shop / showcase selling system
4. expedition map system
5. manual timeline battle system

### Tier 1 support systems
Build alongside the core:
1. adventurer / staff system
2. inventory system
3. quest / unlock system
4. save/load system

### Later systems
Can be added after the core loop feels right:
1. richer skill system
2. recipe tree depth
3. customer demand simulation
4. staff recruitment breadth
5. offline town processing

---

## 7. Design constraints

Use these as default rules:

1. The shop loop is primary; battle exists to serve it.
2. Crafted gear should have multiple sinks whenever practical.
3. Town logic and combat logic should stay separate.
4. Content expansion should favor adding data over rewriting systems.
5. Domain logic should remain deterministic and testable.
6. Runtime state must stay serializable for local saves.
7. A small but polished vertical slice is better than many disconnected systems.

---

## 8. Architecture intent

The rebuild should still favor:

- `content/`: static data definitions
- `domain/`: pure rules and state transitions
- `application/`: orchestration and UI-facing use cases
- `ui/`: formatting and presentation helpers
- `infra/`: persistence and browser adapters

Important architectural rule:
shop logic, exploration logic, and combat logic may interact through shared state, but they should not collapse into one giant UI component.

---

## 9. Open decisions

These remain intentionally flexible:

- exact customer demand model
- number of equipment slots in the final design
- skill complexity in battle
- whether town shifts are real-time, turn-based, or both
- long-term staff recruitment breadth
- progression pacing and recipe density

When forced to choose for the prototype, choose the simplest reversible version.

---

## 10. Implementation philosophy for Codex

When editing this repo, optimize for:

- correctness
- extensibility
- clean state shape
- testability
- data-driven content
- maintainable iteration speed

Do not optimize for anti-cheat, multiplayer, or live-service constraints.

---

## 11. Glossary

Use these terms consistently:

- Adventurer = controllable character who can work and fight
- Assignment = that adventurer's current town/field role
- Equipment = crafted gear that can be equipped or sold
- Showcase = the stock currently placed out for customers
- Shop Shift = a sale-processing step for stocked goods
- Expedition = entering a district map from town
- Tile Event = resource, treasure, encounter, or exit trigger on the grid
- Timeline Battle = speed-driven manual battle order
- Main Quest = progression-driving objective
- Shop Request = item-demand side objective
