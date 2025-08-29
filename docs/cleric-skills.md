# Cleric Skills Design

## Shared Skill State Diagram
```mermaid
stateDiagram-v2
    [*] --> Ready
    Ready --> Casting: Input
    Casting --> Recover: Spell resolves
    Recover --> Ready: Cooldown expires
```

## Skill List

| Rank | Skill Name | Description | Skill Type |
| --- | --- | --- | --- |
| 1 | Heal | Single-target healing spell | Utility (Healing) |

> **TODO:** Flesh out additional cleric skills and progression tiers beyond Rank 1.

## Skills
### Heal
- **Cooldown:** 5 s
- **Healing:** `12 + 3 * INT`
- **Range:** 6 m
- **Mana Cost:** 15
- **Critical:** Uses standard spell critical chance; critical heals restore 150% of normal healing.
- **Details:** Single-target heal; can be self-cast.

## Open Questions
- Should Clerics have additional healing and support abilities?

## Acceptance Criteria
- Each skill follows the shared state diagram and respects its cooldown.
- Damage/healing formulas are implemented exactly as specified.
- Casting animations lock out movement during Casting phase.
- Unit tests cover cooldown enforcement and formula calculations.
