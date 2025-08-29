<<<<<<< HEAD
# LÖVE Rebuild TODO Checklist

This checklist tracks remaining work to build Arcane Realms from scratch using LÖVE and a new Node.js server.

- [ ] **Project Setup**
  - [ ] Initialize `client/` Lua project with `main.lua` and `conf.lua`.
  - [ ] Initialize `server/` TypeScript project with Express and `ws`.
  - [ ] Choose dependency managers (`luarocks` and `npm`) and document installation.
  - [ ] **Networking Layer**
    - [ ] Add `lua-websockets` client and wrap send/receive API.
    - [ ] Implement server WebSocket handlers for join/leave, movement, skills, and chat.
    - [ ] Define JSON schemas for all messages and document in `docs/API.md`.
    - [ ] Implement reconnect and error handling strategy.
    - [ ] Perform connection handshake and heartbeat ping/pong.
    - [ ] Evaluate ENet/UDP transport for future low-latency play.
- [ ] **State Management**
  - [ ] Implement `StateStack` or adopt `hump.gamestate`.
  - [ ] Implement `Play`, `Forge`, `Test`, and `Loading` states.
- [ ] **Gameplay Systems**
  - [ ] Implement player entity, movement, and basic attack.
  - [ ] Implement enemy entities with telegraphed attacks and death handling.
  - [ ] Port Mage and Cleric skill sets.
  - [ ] Add loot drops and shard scoring.
=======
# LÖVE Migration TODO Checklist

This checklist tracks remaining work to fully migrate Arcane Realms to the LÖVE framework.

- [ ] **Project Setup**
  - [ ] Initialize `client/` Lua project with `main.lua` and `conf.lua`.
  - [ ] Choose dependency manager (e.g., `luarocks`) and document installation.
- [ ] **Networking Layer**
  - [ ] Add `lua-websockets` (or equivalent) and wrap send/receive API.
  - [ ] Define JSON message schemas for movement, skills, chat, and world snapshots.
  - [ ] Implement reconnect and error handling strategy.
- [ ] **State Management**
  - [ ] Implement `StateStack` or adopt `hump.gamestate`.
  - [ ] Port `Play`, `Forge`, and `Test` scenes to Lua states.
>>>>>>> main
- [ ] **Input & Controls**
  - [ ] Map keyboard/mouse callbacks to movement and skills.
  - [ ] Support controller input and remapping options.
- [ ] **Rendering**
  - [ ] Load and animate player and enemy spritesheets.
  - [ ] Implement camera following and zooming.
  - [ ] Render tilesets for procedural world chunks.
- [ ] **UI**
  - [ ] Build chat panel with text entry and scrollback.
  - [ ] Create skill bar with cooldown visuals.
  - [ ] Implement developer console for logs.
- [ ] **Forge Integration**
<<<<<<< HEAD
  - [ ] Implement state that communicates with the web‑based Forge tools.
=======
  - [ ] Implement state that communicates with existing Forge web tools.
>>>>>>> main
  - [ ] Support spawning test enemies and loading tile prototypes.
- [ ] **Audio**
  - [ ] Load and play sound effects and music loops.
  - [ ] Provide volume controls and mixing.
- [ ] **Asset Pipeline**
  - [ ] Populate `client/assets/images` with required spritesheets.
  - [ ] Populate `client/assets/sounds` with listed effects and music.
  - [ ] Include bitmap fonts for UI and console.
<<<<<<< HEAD
  - [ ] Document asset naming conventions and tagging in `asset-catalog.md`.
- [ ] **Server Features**
  - [ ] Persist player data to Postgres.
  - [ ] Cache transient data in Redis.
  - [ ] Integrate Milvus for vector memory storage.
  - [ ] Expose REST endpoints for `/join`, `/llm`, and `/assets`.
  - [ ] Write Vitest suites for message handlers and world generation.
  - [ ] **Build/Distribution**
    - [ ] Document packaging via `.love` files and platform-specific binaries.
    - [ ] Automate builds with CI scripts for Windows, macOS, and Linux.
- [ ] **Testing**
  - [ ] Create unit tests for networking and state transitions (e.g., using `busted`).
  - [ ] Hook into server Vitest suites for integration testing.
- [ ] **Documentation**
  - [ ] Update all docs as features land.
  - [ ] Record troubleshooting steps specific to LÖVE and Lua.
=======
- [ ] **Build/Distribution**
  - [ ] Document packaging via `.love` files and platform-specific binaries.
  - [ ] Automate builds with CI scripts.
- [ ] **Testing**
  - [ ] Create unit tests for networking and state transitions (e.g., using `busted`).
  - [ ] Hook into existing server Vitest suites for integration testing.
- [ ] **Documentation**
  - [ ] Update all docs once migration is complete.
  - [ ] Record troubleshooting steps specific to LÖVE and Lua.

>>>>>>> main
