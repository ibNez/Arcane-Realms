# World Expansion Requirements

Arcane Realms features a world that grows outward whenever players reach its current edge. This document captures the gameplay and narrative requirements for that expansion system.

## Initial World Layout
- The launch world consists of **Nexus Town** (4×4 grid) surrounded on each side by a 4×4 wilderness.
- Four additional 4×4 wilderness blocks fill the corners, forming a **12×12** grid.
- Enemy level increases by **1** for each block away from the town; the outer ring of the starting world contains level‑4 mobs.

## Edge Barrier Event
- The perimeter of the known world is guarded by an **Aegis Wall** (a manifestation of the Edge).
- When players touch the boundary, a **Wall War** begins: spectral **Watchers** spawn at the wall to hold back expansion.
- Watcher spawn rate accelerates as their numbers fall, requiring sustained, server‑wide effort.
- Players must defeat a global kill threshold to destabilize the wall.
- Once the threshold is met, the wall drops and a **24‑hour countdown** begins before the new land opens.

## Asset Generation and Review
- The moment the Wall War triggers, the next region’s assets are generated and stored in asset storage.
- Assets remain locked for **one real‑world day** to allow the development team (the “Arcane Forge”) to review content for quality and safety.
- After the countdown ends, reviewed assets are promoted and the new territory becomes explorable.

## Rewards
- Watchers at the wall drop the **best loot for the current level bracket**.
- Players present when the wall collapses earn **Vanguard rewards** (e.g., titles, cosmetic items, treasure caches).
- Once a wall is broken it never reforms; the region stays open permanently with standard mob spawns.

## Growth Pace
- Higher‑level regions take players longer to reach, naturally spacing out expansions.
- Expansion cadence slows over time, giving the team more opportunity to review large, complex regions.

## Mob Density and Player Progression
- Towns and other settled hubs act as sanctuaries where no hostile creatures spawn.
- Spawn density is calculated outward from each town. The farther a player travels from a safe zone, the more frequent the mob encounters.
- Newly revealed frontier cells start sparse and build to heavy concentrations at the edge of explored land, hinting at the next expansion.
- Each mob is procedurally generated as an image sprite and assigned attributes when created. It remains at the level of its home area rather than scaling with players.
- Difficulty rises the farther one moves from the starting town, naturally dividing the world into level bands. New players progress by grinding through inner rings before venturing outward, while veterans push the frontier forward.
