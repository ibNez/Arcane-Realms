# Top-Down ARPG MVP v0.2 (LÖVE + Node + Offline AI)
This build adds a Chat panel (press **C**) that talks to `/llm` on the server (Ollama if running, stub otherwise),
and keeps the improved input (WASD + arrows + click-to-move; keys cancel click-to-move immediately).

This repository ships with **Arcane Forge**, the local development environment for Arcane Realms. See
[docs/arcane-forge.md](docs/arcane-forge.md) for full setup details.

## Arcane Realms – Game Overview
Arcane Realms is a fast-paced top-down action RPG built around limitless exploration and emergent adventures. The world is a living tapestry generated as players push into the unknown: seamlessly stitched Realm Tiles expand outward, each tile a hand-crafted 1024 × 1024 landscape spun up by Stable Diffusion. Biomes shift from forests to deserts to coastal cities, enemies scale in difficulty the farther you roam, and resource-rich points of interest materialize just beyond the horizon.

### Dynamic World & Encounters
- **Procedural Realms:** Every zone is generated on demand; once discovered, it persists for the entire community, creating a shared history.
- **Adaptive Environment:** Asset generation transforms base components to match the local biome—moss-covered forest walls, sun‑bleached desert houses, etc.
- **NPC Ecosystem:** AI-driven NPCs possess personalities, daily routines, and social networks. They remember interactions, gossip about player deeds, and spawn dynamic quests that evolve the storyline.
- **Combat & Progression:** Tight WASD movement, click-to-move, and telegraphed enemy attacks form the core of combat. Boss fights escalate to group and massive raid encounters, rewarding teamwork and strategy.
- **Limitless Discovery:** Exploration is incentivized by first-discovery rewards, hidden events, and radial difficulty scaling that pushes players outward as they grow stronger.

## Arcane Forge – Development Environment
Arcane Forge is the integrated playground where designers and programmers craft, test, and iterate on Arcane Realms’ systems. It bundles client and server tooling, asset pipelines, and optional offline AI services into a cohesive local stack.

### Key Capabilities
- **Environment Builder:** Assemble and validate Realm Tiles with drag‑and‑drop components, snap‑to‑grid placement, and neighbor previews to guarantee seamless world edges.
- **Character Pipeline:** Run Vitest suites and generation queues to vet the AI-powered character creation system, including content filtering and fallback logic.
- **AI Integration Sandbox:** Optional Docker‑based stack for offline LLMs enables testing NPC dialogue, quest generation, and contextual responses without external dependencies.
- **Test Area & Tooling:** Dedicated scenes allow spawning enemies, toggling AI, validating collisions, and stress‑testing skills like Magic Missile or Arcane Nova.
- **Rapid Iteration:** Hot‑reload server/client builds, structured asset catalogs, and QA scripts let developers refine combat, world generation, and NPC behavior in real time.

Together, Arcane Realms delivers an endlessly evolving adventure, while Arcane Forge empowers creators to shape every spell, tile, and quest that makes the world come alive.

Core technologies:
- LÖVE 11.x (Lua)
- Node.js
- Vite (asset tooling)
- Docker

See the [API reference](docs/API.md) for available REST routes and WebSocket messages.

For component metadata and images used throughout the world, consult the
[asset catalog](docs/asset-catalog.md).

Refer to the [contribution guidelines](CONTRIBUTING.md) and [project roadmap](docs/ROADMAP.md) for more documentation.

## Run (Arcane Forge)
1) Server
   ```bash
   cd server
   cp .env.example .env   # optional
   npm i
   npm run dev
   ```
   Server: http://localhost:8080

2) Client
   ```bash
   # requires LÖVE 11.x https://love2d.org/
   cd client
   love .
   ```
   Game window launches via LÖVE
   Forge tools: http://localhost:5173/forge

3) (Optional) AI services
   ```bash
   # separate terminal
   cd ops
   docker compose up -d ollama postgres redis milvus
   # on host:
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```


---
## v0.3 Additions
- Procedural arena (rooms + walls as vector shapes)
- Enemies that spawn from gates and pursue the player
- Left-click shoots projectiles toward the cursor
- Player/enemy health, hit flashes, simple damage numbers
- Loot shards drop; walk over to collect (adds score)
- Keeps chat (C) and movement (WASD/Arrows, click-to-move with cancel on key press)

Controls: WASD/Arrows to move • Left click to shoot • C to chat


---
## v0.3R Revamp
- **Goal:** Collect shards to charge the exit portal. When you reach the shard goal, an exit opens—reach it to win the run.
- **Controls:** WASD/Arrows to move • **Left Click** = point-to-move • **Right Click or Space** = shoot toward cursor • **C** = chat.
- **Spawns:** Enemies telegraph with a brief warning pulse, then emerge at arena gates or offscreen edges—no instant pop-ins on the player.
- **Visuals:** Cleaner arena, rounded obstacles, subtle strokes and depth ordering.


### v0.3R2 Hotfix
- Fixed enemy spawning (removed bad `self` reference in telegraphed spawner).
- Chat toggle now uses `JustDown(C)` to prevent instant re-toggle.
- Chat input captures **all** keydowns while focused, so the window won’t close when typing.
- Movement no longer halts unexpectedly due to chat toggle glitches.



---
## v0.3T — Test Area Build
See [docs/test-area.md](docs/test-area.md) for a detailed overview of the Test Area used to verify character and enemy interactions.
Adds a dedicated **TestScene** with a clean arena and a DOM control panel:
- **Spawn Enemy**: adds a single enemy at a test marker.
- **Toggle AI**: pause/resume enemy pursuit (for NPC movement tests).
- **Clear Enemies**: remove all current enemies/loot.
- **Reset Player**: center player and restore HP.
- **Toggle Chat (C)**: open/close chat panel.
- **Targeting**: click an enemy to lock on; **Tab** cycles targets.
- **Skill Q — Magic Missile**: fires at the **locked** target (or nearest within 250px if none locked).


---
## v0.3T4 — Arcane Nova (Skill 2)
- **Skill 2: Arcane Nova (AoE)** — press **2** or **E**.
  - Shows a circular **telegraph** (wind-up ~300ms), then **detonates**.
  - Damages **all enemies** in radius and **knocks them back** slightly.
  - Own cooldown (default **1500ms**) on **slot 2** of the skills bar.
- Test panel adds **Spawn 5 Enemies** for quick stress tests.

