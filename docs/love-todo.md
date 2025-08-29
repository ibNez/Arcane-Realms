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
  - [ ] Implement state that communicates with existing Forge web tools.
  - [ ] Support spawning test enemies and loading tile prototypes.
- [ ] **Audio**
  - [ ] Load and play sound effects and music loops.
  - [ ] Provide volume controls and mixing.
- [ ] **Asset Pipeline**
  - [ ] Populate `client/assets/images` with required spritesheets.
  - [ ] Populate `client/assets/sounds` with listed effects and music.
  - [ ] Include bitmap fonts for UI and console.
- [ ] **Build/Distribution**
  - [ ] Document packaging via `.love` files and platform-specific binaries.
  - [ ] Automate builds with CI scripts.
- [ ] **Testing**
  - [ ] Create unit tests for networking and state transitions (e.g., using `busted`).
  - [ ] Hook into existing server Vitest suites for integration testing.
- [ ] **Documentation**
  - [ ] Update all docs once migration is complete.
  - [ ] Record troubleshooting steps specific to LÖVE and Lua.

