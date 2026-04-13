# Codex Rules

## 1. Your role in this repository

You are working inside a from-scratch rebuild of a web game project.

Your job is to help implement a **clean, extensible, data-driven game architecture** for a monster capture + combat + management + crafting + idle game.

Do not behave like a code generator that only tries to satisfy the nearest prompt. Behave like an engineer maintaining long-term project coherence.

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
- explain assumptions when the spec is incomplete

### Never do these
- do not rewrite large areas without need
- do not introduce hidden magic or surprising abstractions
- do not hard-code design assumptions that are still open questions
- do not mix domain logic into UI code unless the repo already requires it
- do not add dependencies casually
- do not silently ignore failing tests or type errors
- do not leave TODOs in place of core logic unless explicitly asked

---

## 4. Architecture rules

### 4.1 Keep static data separate from runtime state
Examples:
- monster templates != monster instances
- item definitions != inventory entries
- map definitions != live map session state

### 4.2 Keep domain logic separate from presentation
UI components should display state and trigger actions.
They should not own core combat formulas, reward formulas, settlement formulas, or content rules.

### 4.3 Prefer pure functions for game rules
Whenever possible, implement gameplay logic as deterministic functions that:
- accept explicit input state
- return explicit output state / events
- avoid implicit global mutation

This is especially important for:
- battle resolution
- idle settlement
- crafting recipes
- quest completion checks
- economy calculations

### 4.4 Design for serialization
Game state should remain save/load friendly.
Avoid class-heavy patterns or browser-coupled state containers when simple serializable objects work.

### 4.5 Design for content expansion
When adding a new monster, item, map, or quest, the default path should be “add data” rather than “edit engine logic”.

---

## 5. Preferred implementation order

When a task is broad, bias toward this order:

1. define domain model / types
2. define state transitions or use cases
3. add tests for rules
4. wire persistence or adapters if needed
5. connect UI last

If UI-first work is requested, still keep game rules extractable.

---

## 6. Rules for incomplete design areas

The project intentionally leaves some areas open.
Examples include:
- growth model details
- idle settlement exact numbers
- store complexity depth
- combat complexity depth

When touching these areas:
- choose the simplest viable model
- keep interfaces open for later replacement
- avoid irreversible schema decisions unless necessary
- mark temporary balancing constants clearly

Good pattern:
- build an interface + simple default implementation
- keep formulas centralized
- avoid scattering balance values across files

---

## 7. Code quality standards

### Naming
- use clear domain names
- prefer full words over abbreviations
- keep terminology consistent with `project_context.md`

### Functions
- prefer small, focused functions
- keep function side effects obvious
- avoid long parameter lists when a typed object is clearer

### Types
- define important domain types explicitly
- do not hide important game state in `any`
- prefer discriminated unions / enums for controlled state where appropriate

### Errors
- fail loudly on impossible states
- use defensive validation at data boundaries
- avoid swallowing errors silently

### Comments
- comment the reason, not the obvious syntax
- add short doc comments for non-obvious domain rules

---

## 8. Testing rules

For any non-trivial gameplay change, add tests or update tests.

Prioritize tests for:
- battle timeline resolution
- lineup/front-unit behavior
- reward calculation
- crafting validation
- quest requirement checks
- offline/idle settlement
- synthesis / duplicate consumption

Prefer fast unit tests for domain logic.
Use integration tests only where module interaction actually matters.

If the repo currently lacks tests in an area, start with the smallest useful test coverage instead of skipping tests entirely.

---

## 9. Editing rules

### When adding a feature
- inspect neighboring patterns first
- reuse existing conventions where they are sound
- create new abstractions only when repetition or future extension justifies them

### When refactoring
- preserve behavior unless the task explicitly changes behavior
- state the behavioral delta clearly when it changes
- avoid opportunistic refactors unrelated to the task unless they unblock correctness

### When fixing bugs
- identify the actual root cause
- prefer fixing the invariant instead of patching symptoms
- add regression coverage when practical

---

## 10. Dependency policy

Before adding a new dependency, assume the default answer is “no”.

Only add one when at least one of the following is true:
- it removes substantial complexity
- it is already standard in the repo stack
- it solves a problem that should not be reimplemented internally

If a lightweight local utility is enough, prefer the local utility.

---

## 11. Performance policy

Do not prematurely optimize.

First prioritize:
- correct rules
- understandable state flow
- maintainable code

Only optimize when:
- a hot path is obvious, or
- measurement shows a real issue

When optimizing, keep code readable and preserve test coverage.

---

## 12. Documentation policy

Update documentation when you change:
- architecture
- public interfaces
- folder structure
- save schema
- balancing model assumptions
- developer workflow

Keep docs concise and operational.
Do not write marketing copy.

---

## 13. Output format for implementation tasks

Unless the user asks otherwise, structure your response like this:

1. what you changed
2. why this approach
3. files touched
4. risks / follow-up
5. verification performed

Keep it short and concrete.

---

## 14. What “done” means

A task is not done just because code was written.

A task is done when most of the following are true:
- the requested behavior exists
- code matches local architecture
- types are coherent
- obvious edge cases are handled
- tests pass or the missing coverage is clearly called out
- docs are updated when needed
- no unnecessary unrelated breakage was introduced

---

## 15. Special rules for this project

### Monster-related changes
Always ask:
- is this template data or instance state?
- does this affect combat, labor, or both?
- does this accidentally make duplicate monsters useless?

### Item-related changes
Always ask:
- is this item part of battle flow, economy flow, or both?
- is the item sink/source relationship clear?

### Map-related changes
Always ask:
- is this world-level or map-level data?
- are map restrictions being respected?
- should this affect active combat, idle combat, or neither?

### Quest-related changes
Always ask:
- is this permanent progression or timed demand?
- does it reinforce the main gameplay loop?

---

## 16. If you are unsure

If the task is ambiguous:
1. infer from existing code and `project_context.md`
2. choose the simplest reversible solution
3. state your assumption explicitly

Do not freeze. Do not over-design. Do not invent a massive framework just because the future might need it.


