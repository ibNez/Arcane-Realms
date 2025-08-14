# Top-Down ARPG MVP v0.2 (Phaser + Node + Offline AI)
This build adds a Chat panel (press **C**) that talks to `/llm` on the server (Ollama if running, stub otherwise),
and keeps the improved input (WASD + arrows + click-to-move; keys cancel click-to-move immediately).

## Run (Dev)
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
   cd client
   npm i
   npm run dev
   ```
   Client: http://localhost:5173

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

