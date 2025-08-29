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

> **TODO:** Describe how the FSM handles multiple players targeting the same enemy.

## Cooldowns
- **Wind-up:** 0.5 s telegraph before attack.
- **Attack:** Instant damage frame.
- **Recover:** 1.0 s before returning to Idle or Pursue.

## Damage Formula
`damage = baseDamage * (1 + 0.1 * enemyLevel)`

## Ranged Enemy States
Ranged foes branch into a different attack sequence once they reach
their desired distance from the player.

- **Aim:** After `Pursue`, a ranged enemy stops to track the player's
  movement for a short aiming window instead of entering `WindUp`. During
  this state the enemy cannot move but continuously rotates to keep the
  player in sight.
- **Shoot:** When the aim timer completes the enemy fires a projectile in
  the last tracked direction. This replaces the instant melee `Attack`
  state and can damage the player from afar.

Unlike melee enemies, ranged units never use the `WindUp`/`Attack`
combo. They rely on maintaining distance, locking on during `Aim`,
releasing a projectile during `Shoot`, and then transitioning to
`Recover` before deciding whether to `Pursue` again or return to
`Idle`.

## Open Questions
- Should different enemy types override the default timers?
- How are interrupts or stuns represented in the state machine?
- Do ranged enemies share the same state flow or branch after Pursue?
> **TODO:** Define separate behaviors for ranged and special enemy types.

## Acceptance Criteria
- Enemy state transitions follow the diagram above and are driven by timers and player proximity.
- Cooldowns are configurable per enemy type.
- Damage calculation uses the specified formula with unit tests covering at least Idle→Attack→Recover flow.
- Telegraphed attack visuals play during Wind-up phase.
