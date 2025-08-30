# Arcane Realms – LÖVE Software Design

This document provides an end‑to‑end plan for rebuilding Arcane Realms with the [LÖVE](https://love2d.org/) framework. It covers gameplay, client and server architecture, networking protocol, asset requirements, and build steps so the project can be implemented without referring to the legacy Phaser code.

## 1. Goals
- Native desktop client using **LÖVE 11.x** and Lua.
- Cross‑platform builds for Windows, macOS, and Linux.
- Multiplayer over WebSockets with a lightweight Node.js server.
- Offline AI stack for content generation and NPC dialog.

## 2. Gameplay Overview
- **Core Loop:** explore procedurally generated Realm Tiles, defeat enemies, collect loot, and push outward for harder encounters.
- **Classes:** initial release includes **Mage** and **Cleric** with distinct skill sets. Additional classes can be added by extending the skill system.
- **Combat:** WASD or arrow‑key movement, click‑to‑move, and skill hotkeys (Q/E/R). Enemies telegraph attacks; players dodge, cast spells, and chat.
- **Progression:** shards and gear improve stats; first‑discovery bonuses encourage exploration.
- **Forge:** an editor state for testing tiles, enemies, and assets inside the client.

## 3. Directory Structure
```
client/
├── main.lua              -- entry point
├── conf.lua              -- window settings
├── core/                 -- engine helpers (state stack, timers, assets)
├── states/               -- play, forge, test
├── net/                  -- websocket client
├── ui/                   -- chat, skill bar, dev console
└── assets/               -- images/, sounds/, fonts/

server/
├── src/
│   ├── index.ts          -- start HTTP + ws server
│   ├── world/            -- world state & generation
│   ├── players/          -- connection and movement handling
│   ├── skills/           -- skill validation and cooldowns
│   └── chat/             -- chat relay
├── tests/                -- Vitest suites
└── package.json
```

## 4. Build & Run
1. Install LÖVE 11.x and Node.js 20.x.
2. From `client/` run `love .` to launch the game.
3. From `server/` run `npm install` and `npm run dev` to start the backend.
4. Package the client by zipping `client/` contents and renaming to `game.love`. Distribute by bundling with platform‑specific `love` executables or via tools such as [love-release](https://github.com/pfirsich/love-release).

## 5. Client Modules
### 5.1 main.lua
- Seeds RNG, loads config, initializes `StateStack` and WebSocket.
- Pushes `PlayState` after assets load.

### 5.2 StateStack
- Minimal stack; states implement `enter`, `update(dt)`, `draw`, and input callbacks.
- Useful states: `PlayState`, `ForgeState`, `TestState`, `LoadingState`.

### 5.3 Networking
- Implemented via [`lua-websockets`](https://github.com/lipp/lua-websockets).
- JSON messages: `{ type:"move", x, y }`, `{ type:"chat", text }`, `{ type:"skill", id, target }`, world snapshots, etc.
- Exponential backoff reconnects on disconnect.
- Future enhancement: optional ENet transport for lower‑latency UDP.

### 5.4 Rendering & Camera
- `love.graphics.translate` for camera, spritesheets animated with quads.
- Tile maps loaded per chunk (1024×1024). UI drawn last with fixed projection.

### 5.5 Input
- WASD/arrow keys for movement.
- Left click to move/attack; right click or Space for basic attack.
- `1`/`Q`, `2`/`E`, `3`/`R` for skills; **C** toggles chat.

### 5.6 UI
- Immediate‑mode widgets: `chat.lua`, `skillbar.lua`, `console.lua`.
- UI state handled separately from gameplay states.

### 5.7 Forge Tools
- Browser‑based Forge editor communicates with the server.
- LÖVE client exposes a `ForgeState` for live testing of assets and enemies.

## 6. Networking Protocol
- WebSocket endpoint: `ws://localhost:8080`.
- REST endpoints:
  - `POST /join` – obtain session id.
  - `POST /llm` – NPC dialog via Ollama.
  - `GET /assets` – list of available assets.
- Messages are JSON encoded; all messages include `type` and `playerId` fields.
- Connection handshake: client sends `{type:"join", name}` and receives a `{type:"welcome", id}` response before gameplay messages flow.

## 7. Server Design
- **Stack:** Node.js 20, TypeScript, `ws`, `express`.
- **Modules:**
  - `players/` – tracks connections, positions, and stats.
  - `world/` – loads/generates realm tiles and spawns enemies.
  - `skills/` – validates skill casts and applies damage.
  - `chat/` – relays chat and system messages.
- **Persistence:** Postgres stores player data, Redis handles pub/sub, Milvus records vector memories. Connection strings are supplied via `.env`.
- **Game Loop:** tick at 60 Hz, broadcasting entity positions and events.
- **Testing:** Vitest suites cover message handlers and world generation.

## 8. Asset Requirements
Assets live under `client/assets`.

### 8.1 Images
| Asset | Size | Notes |
|-------|------|------|
| Player spritesheet (idle, walk, shoot) | 256×256 | 8‑directional frames |
| Enemy spritesheets (goblin, skeleton, etc.) | 256×256 each | include attack and death frames |
| Projectile sprites (magic missile, nova ring) | 64×64 | transparent |
| Tilesets per biome (forest, desert, ruins) | 1024×1024 tiles | generated via Stable Diffusion |
| UI elements (skill icons, chat window, buttons) | varies | PNG with alpha |
| Cursor image | 32×32 | optional custom cursor |

### 8.2 Audio
| Asset | Length | Notes |
|-------|--------|------|
| Footstep loop | ~1s | grass/stone variants |
| Magic missile cast | ~0.5s | |
| Arcane nova detonation | ~1s | |
| Enemy hit/death sounds | ~0.5s each | |
| Ambient music loop | 60‑90s | per biome |
| UI click/confirm sounds | <0.3s | |

### 8.3 Fonts
- Bitmap font for UI (16 px and 32 px sizes).
- Monospace font for developer console.

## 9. Offline AI Stack
Optional services run via `docker-compose` in `ops/`:
- **Ollama** – LLM host for dialog.
- **Postgres** – persistent game state.
- **Redis** – pub/sub and caches.
- **Milvus** – vector memory for NPCs and procedurally generated content.

## 10. Future Enhancements
- Client‑side prediction and reconciliation.
- Mobile touch controls (`love.touchpressed`).
- Asset hot‑reload during development.
- Server authoritative physics and cheat prevention.

## 11. References
- LÖVE wiki: https://love2d.org/wiki/Main_Page
- lua-websockets: https://github.com/lipp/lua-websockets
- dkjson: http://dkolf.de/src/dkjson-lua.fsl/home

