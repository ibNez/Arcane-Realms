# Enemy FSM Design

## State Diagram
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Pursue: Player detected
    Pursue --> WindUp: In range
    WindUp --> Attack: Wind-up timer
    Attack --> Recover: After hit
    Recover --> Idle: Cooldown over
    Recover --> Pursue: Player still in range
```

## Cooldowns
- **Wind-up:** 0.5 s telegraph before attack.
- **Attack:** Instant damage frame.
- **Recover:** 1.0 s before returning to Idle or Pursue.

## Damage Formula
`damage = baseDamage * (1 + 0.1 * enemyLevel)`

## Open Questions
- Should different enemy types override the default timers?
- How are interrupts or stuns represented in the state machine?
- Do ranged enemies share the same state flow or branch after Pursue?

## Acceptance Criteria
- Enemy state transitions follow the diagram above and are driven by timers and player proximity.
- Cooldowns are configurable per enemy type.
- Damage calculation uses the specified formula with unit tests covering at least Idle→Attack→Recover flow.
- Telegraphed attack visuals play during Wind-up phase.
