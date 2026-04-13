# Project Context

## 1. Project identity

- Working name: `Monster Agency`
- Genre: monster capture + combat + management + crafting + idle/offline progression
- Platform: web frontend first
- Core expectation: can run online and support offline idle settlement
- Product direction: small-scope but extensible systems game, built from a data-driven foundation rather than hard-coded content

This repository is a **from-scratch rebuild**. Favor clean architecture, explicit boundaries, and content-driven expansion over quick hacks.

---

## 2. Core fantasy

The player travels across different worlds with a demon pot / monster vessel, captures monsters, and assigns them to different jobs.

Monsters are never just combat units. They should always have at least one meaningful destination:

1. active combat
2. idle farming
3. store/management work
4. crafting/production
5. synthesis / duplicate consumption

A good implementation keeps these roles connected through a single resource loop.

---

## 3. Primary gameplay loop

The intended macro loop is:

1. Explore a map
2. Fight enemies / capture monsters
3. Unlock new maps and content
4. Assign monsters to combat, idle, store, or crafting roles
5. Generate materials through battle and idle systems
6. Craft items from shared materials
7. Use crafted items for either combat power or economic delivery
8. Complete side quests for high-value rewards
9. Reinvest rewards into stronger progression
10. Return to exploration and continue the loop

Design rule: every major system must feed this loop instead of existing as isolated feature bloat.

---

## 4. Product pillars

### Pillar A: One monster, many roles
The same monster framework must support combat and labor roles.

### Pillar B: One item chain, many sinks
Materials and crafted items should serve both battle and economy.

### Pillar C: Map identity matters
Maps are not cosmetic; each map has local monster pools and deployment restrictions.

### Pillar D: Redundant monsters still matter
Duplicate or non-main-team monsters must remain valuable through labor, idle work, or synthesis.

### Pillar E: Data-driven expansion
New monsters, maps, quests, items, and encounters should be addable mostly through data/config instead of logic rewrites.

---

## 5. Current game structure

## 5.1 Monster System
Monsters are the main unit in the game.

### Monster template (`MonsterTemplate`)
Static content definition. Should be data-driven.

Suggested fields:
- `id`
- `name`
- `species`
- `rarity`
- `tags`
- `baseStats`
- `growthCurveId`
- `skillPool`
- `traitPool`
- `laborProfile`
- `visuals`

### Monster instance (`MonsterInstance`)
Player-owned runtime entity.

Suggested fields:
- `instanceId`
- `templateId`
- `isShiny`
- `level`
- `exp`
- `starRank`
- `shinyStarRank`
- `skills`
- `equips`
- `traits`
- `currentAssignment`
- `currentMapId`
- `lockState`

### Dual dimensions
Every monster may expose two independent evaluation surfaces:
- combat dimension
- labor dimension

Do not collapse them into one oversimplified number too early.

### Duplicate handling
- same monster can be captured multiple times
- duplicates are meaningful
- duplicates can be used for synthesis / star upgrade / cap increase
- same monster template should not appear twice in the same combat lineup

---

## 5.2 Combat System
Current reference direction:
- timeline-driven battle
- queue-based lineup structure
- front unit acts
- actions consume time

### Active combat
Used for:
- map progression
- normal encounters
- elite/boss encounters
- capture opportunities

### Idle combat
Used for:
- online/offline material production
- passive resource generation
- map-specific farming

Important: idle combat may be a simplified simulation and does **not** need to mirror full active battle complexity one-to-one.

### Combat constraints
Combat system should:
- read battle-ready monster data
- resolve actions, states, damage, and outcome
- avoid mutating static content definitions

Combat system should not directly own:
- world progression rules
- quest progression logic
- store economy rules

---

## 5.3 Map / World System
The player travels between worlds. Each world contains maps with unique monster pools and rules.

### World (`World`)
Suggested fields:
- `id`
- `theme`
- `rules`
- `monsterPool`
- `mapIds`

### Map (`Map`)
Suggested fields:
- `id`
- `worldId`
- `tileData`
- `collisionData`
- `encounterTable`
- `eventPoints`
- `unlockCondition`

### Map restrictions
A monster can only:
- fight in its allowed/current map context
- idle in its assigned map

Changing map should require lineup / assignment reconfiguration.

These systems are **not** restricted by map:
- store
- crafting
- item selling

---

## 5.4 Crafting System
Crafting consumes materials from battle and idle outputs.

Crafted items must support two major sinks:

### Combat sink
- consumables
- temporary boosts
- battle support items

### Economy sink
- goods for store sale
- goods required by side quests

Crafting is a bridge system between combat progression and economy.

---

## 5.5 Store / Management System
Monsters assigned to store work cannot simultaneously fight or idle.

Store goals:
- convert crafted goods into gold
- serve as major gold source
- act as a delivery point or fulfillment surface for side quests

The store system is an economic assignment layer, not just a passive menu.

---

## 5.6 Quest System
### Main quest
- no strict time limit
- unlocks maps, story, and systems
- teaches player the intended loop

### Side quest
- randomly generated
- time-limited
- demands specific items
- offers higher-risk, higher-reward payouts

Side quests should pull demand through the crafting and economy pipeline.

---

## 5.7 Supporting systems
The design document currently implies these support domains:
- `InventorySystem`
- `EconomySystem`
- `TimeSystem`
- `EventSystem`
- `ProgressionSystem`
- `AchievementSystem`

Not all need to be implemented on day one. Build them in order of loop importance.

---

## 6. System priority

### Tier 1 core systems
Build these first:
1. Monster system
2. Combat system
3. Economy system
4. Crafting system

### Tier 1 support systems
Build immediately after or alongside the core:
1. Map system
2. Quest system
3. Inventory system
4. Time system

### Tier 2 / Tier 3 systems
Can be deferred until the core loop is stable:
1. Store system polish
2. Progression/unlock system polish
3. Event system
4. Achievement system

---

## 7. Design constraints

Use these as non-negotiable defaults unless explicitly revised.

1. Systems serve the gameplay loop; avoid disconnected mechanics.
2. Monsters must always have meaningful utility.
3. Every important resource should ideally have at least two sinks.
4. Content expansion should mostly happen through data, not logic rewrites.
5. Prefer deterministic, testable domain logic over UI-coupled logic.
6. Preserve clean separation between static definitions and runtime state.
7. Keep simulation logic serializable so save/load and offline settlement remain feasible.

---

## 8. Architecture intent for the rebuild

The rebuild should favor a layered structure similar to:

- `content/` or `data/`: static game definitions
- `domain/`: pure gameplay rules and state transitions
- `application/`: use cases / orchestration
- `ui/`: rendering and interaction
- `infra/`: persistence, adapters, browser APIs

The game should be implementable so that the domain layer can run without the UI.

This is important for:
- testing
- offline simulation
- future balance iteration
- possible save migration tooling

---

## 9. Decisions that are still intentionally open

These areas are **not finalized** and should be kept flexible:
- monster growth model: linear vs branching
- exact idle settlement formula and offline limits
- store gameplay depth: pure numbers vs event-driven management
- active combat depth: more tactical vs more numerical
- exact item taxonomy and recipe density
- long-term progression pacing

Do not hard-code assumptions here unless the task explicitly requires it.

When forced to choose temporarily, choose the simplest implementation that keeps the future extension path open.

---

## 10. Implementation philosophy for Codex

When editing this repo, optimize for:
- correctness
- extensibility
- explicit naming
- low coupling
- testability
- maintainable iteration speed

Do not optimize prematurely for content scale or micro-performance unless profiling shows a real need.

---

## 11. Glossary

Use these terms consistently in code and docs:

- Monster = player-usable creature unit
- Template = static content definition
- Instance = player-owned runtime entity
- Active Combat = manual / foreground battle
- Idle Combat = timed or offline settlement battle loop
- World = top-level thematic region
- Map = explorable area inside a world
- Assignment = what a monster is currently doing
- Crafting = converting materials into items
- Store = selling / fulfilling economic demand
- Main Quest = progression-guided permanent quest
- Side Quest = timed demand-driven quest

