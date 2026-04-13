# Codex Rules

## 1. Your role in this repository

You are working inside a from-scratch rebuild of a web game project.

Your job is to help implement a clean, extensible, data-driven weapon shop RPG inspired by:

- `Weapon Shop Fantasy` for the town / crafting / sales loop
- `Neo Monsters` for tile-based expedition flow and manual timeline battle

Do not optimize for the old monster-management concept.
That direction has been superseded by the current user instruction and `project_context.md`.

---

## 2. Source of truth priority

When making decisions, follow this priority order:

1. explicit user instruction in the current task
2. repository source code and existing tests
3. `project_context.md`
4. this file (`codex_rules.md`)
5. reasonable engineering judgment

If two sources conflict, prefer the higher-priority source and document the conflict briefly.

---

## 3. Mandatory working style

### Always do these
- read relevant files before changing code
- understand the local module boundary before editing
- make the smallest change that solves the real problem
- preserve architecture consistency across files
- prefer explicitness over cleverness
- update docs when behavior or structure materially changes
- add or update tests for non-trivial logic changes
- explain assumptions when the design is incomplete

### Never do these
- do not preserve obsolete monster-specific assumptions just because they existed first
- do not introduce hidden magic or surprising abstractions
- do not hard-code content that should obviously live in data
- do not mix combat formulas into React components
- do not collapse shop logic and expedition logic into one monolithic UI blob
- do not add dependencies casually
- do not silently ignore failing tests or type errors
- do not leave TODOs in place of core logic unless explicitly asked

---

## 4. Architecture rules

### 4.1 Keep definitions separate from runtime state
Examples:
- adventurer definitions != owned adventurer state
- item definitions != inventory quantities
- equipped gear != stocked showcase items
- map definitions != current exploration session

### 4.2 Keep domain logic separate from presentation
UI components may show values, expose actions, and display state.
They should not own smithing formulas, selling formulas, movement validation, turn-order logic, or reward resolution.

### 4.3 Prefer pure functions for rules
Whenever practical, game rules should be deterministic functions that:
- accept explicit state
- return explicit next state or events
- avoid hidden mutation

Prioritize this for:
- crafting
- shop shift selling
- exploration movement
- battle turn progression
- quest completion

### 4.4 Design for serialization
State should remain local-save friendly.
Avoid class-heavy or browser-coupled state when plain serializable objects are enough.

### 4.5 Design for content expansion
New equipment, recipes, maps, enemies, and quests should mostly be add-data operations.

---

## 5. Preferred implementation order

When the task is broad, bias toward:

1. define domain models and types
2. define core state transitions
3. add or update tests
4. wire persistence
5. connect UI

If a UI-first request comes in, still keep the underlying rule logic extractable.

---

## 6. Rules for incomplete design areas

Several design areas are intentionally open:

- customer demand sophistication
- battle skill depth
- recipe tree size
- staffing breadth
- long-term progression pacing

When implementing these:
- choose the simplest viable model
- keep interfaces replaceable
- centralize formulas
- avoid irreversible schema decisions unless required

---

## 7. Code quality standards

### Naming
- use clear domain names from the current weapon-shop context
- prefer `adventurer`, `equipment`, `showcase`, `shopShift`, `exploration`, `battle`
- avoid stale monster terminology unless a file is intentionally transitional

### Functions
- keep functions focused
- make side effects explicit
- prefer typed parameter objects when they improve clarity

### Types
- explicitly model important gameplay state
- avoid `any`
- use unions or enums where the state machine matters

### Errors
- fail loudly on impossible states
- validate at data boundaries
- do not silently swallow invalid game transitions

### Comments
- comment the rule or intent
- avoid obvious syntax narration

---

## 8. Testing rules

For non-trivial gameplay changes, add or update tests.

Prioritize tests for:
- crafting validation and output
- shop shift selling resolution
- exploration movement and tile events
- battle turn progression
- quest requirement checks
- equipment/stat calculation

Prefer fast domain unit tests.

---

## 9. Editing rules

### When adding a feature
- inspect neighboring patterns first
- reuse good conventions
- add new abstractions only when they earn their complexity

### When refactoring
- preserve behavior unless the task intentionally changes it
- if behavior changes, make the delta clear
- avoid unrelated opportunistic rewrites

### When fixing bugs
- identify the invariant that broke
- fix the rule, not just the symptom
- add regression coverage when practical

---

## 10. Dependency policy

Default answer to new dependencies is still `no`.

Only add a dependency when it clearly removes meaningful complexity and fits the repo stack.

---

## 11. Performance policy

Do not prematurely optimize.

First optimize for:
- correct rules
- understandable state flow
- maintainable code

Only optimize when a hot path is obvious or measured.

---

## 12. Documentation policy

Update documentation when you change:
- architecture
- public interfaces
- folder structure
- save schema
- design assumptions
- developer workflow

Keep docs concise and operational.

---

## 13. Done criteria

A task is only done when most of the following are true:

- the requested behavior exists
- code matches the current architecture
- types are coherent
- obvious edge cases are handled
- tests pass or missing coverage is clearly stated
- docs reflect the current design
- no unnecessary unrelated breakage was introduced

---

## 14. Project-specific checkpoints

### Adventurer-related changes
Always ask:
- is this static class data or owned runtime state?
- does this affect town value, combat value, or both?
- does assignment exclusivity remain clear?

### Equipment-related changes
Always ask:
- is the item meant to be equipped, sold, or both?
- is inventory separate from equipment slots and showcase stock?
- does the change reinforce the shop loop?

### Map-related changes
Always ask:
- is this map data or exploration session state?
- are tile transitions validated?
- does this event feed back into crafting or progression?

### Battle-related changes
Always ask:
- is the turn order deterministic?
- is the player making meaningful manual choices?
- can this rule live outside React?

---

## 15. If you are unsure

If the task is ambiguous:
1. infer from the current weapon-shop design direction
2. choose the simplest reversible solution
3. state your assumption explicitly

Do not freeze. Do not over-design. Do not invent a massive framework before the vertical slice earns it.
