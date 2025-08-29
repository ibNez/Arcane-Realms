<<<<<<< HEAD
# Arcane Realms – LÖVE Software Design

This document provides an end‑to‑end plan for rebuilding Arcane Realms with the
[LÖVE](https://love2d.org/) framework. It covers gameplay, client and server
architecture, networking protocol, asset requirements, and build steps so the
project can be implemented without referring to the legacy Phaser code.

## 1. Goals
- Native desktop client using **LÖVE 11.x** and Lua.
- Cross‑platform builds for Windows, macOS, and Linux.
- Multiplayer over WebSockets with a lightweight Node.js server.
- Offline AI stack for content generation and NPC dialog.

## 2. Gameplay Overview
- **Core Loop:** explore procedurally generated Realm Tiles, defeat enemies,
  collect loot, and push outward for harder encounters.
- **Classes:** initial release includes **Mage** and **Cleric** with distinct
  skill sets. Additional classes can be added by extending the skill system.
- **Combat:** WASD or arrow‑key movement, click‑to‑move, and skill hotkeys
  (Q/E/R). Enemies telegraph attacks; players dodge, cast spells, and chat.
- **Progression:** shards and gear improve stats; first‑discovery bonuses
  encourage exploration.
- **Forge:** an editor state for testing tiles, enemies, and assets inside the
  client.

## 3. Directory Structure
=======
# Arcane Realms – LÖVE Client Design

This document describes the end‑to‑end design for the LÖVE implementation of Arcane Realms. It covers
module layout, networking, asset requirements, and build instructions so contributors can recreate the
current client in native Lua.

## 1. Goals
- Native desktop client using [LÖVE 11.x](https://love2d.org/) for rendering and input.
- Reuse the existing Node.js server and WebSocket protocol.
- Preserve gameplay features (movement, combat skills, chat, Forge tools).

## 2. Directory Structure
>>>>>>> main
```
client/
├── main.lua              -- entry point
├── conf.lua              -- window settings
<<<<<<< HEAD
├── core/                 -- state stack, timers, asset loader
=======
├── core/                 -- engine helpers (state stack, timers, assets)
>>>>>>> main
├── states/               -- play, forge, test
├── net/                  -- websocket client
├── ui/                   -- chat, skill bar, dev console
└── assets/               -- images/, sounds/, fonts/
<<<<<<< HEAD

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
4. Package the client by zipping `client/` contents and renaming to
   `game.love`. Distribute by bundling with platform‑specific `love`
   executables or via tools such as
   [love-release](https://github.com/pfirsich/love-release).

## 5. Client Modules
### 5.1 main.lua
- Seeds RNG, loads config, initializes `StateStack` and WebSocket.
- Pushes `PlayState` after assets load.

### 5.2 StateStack
- Minimal stack; states implement `enter`, `update(dt)`, `draw`, and input
  callbacks. Useful states: `PlayState`, `ForgeState`, `TestState`,
  `LoadingState`.

### 5.3 Networking
- Implemented via [`lua-websockets`](https://github.com/lipp/lua-websockets).
- JSON messages: `{ type:"move", x, y }`, `{ type:"chat", text }`,
  `{ type:"skill", id, target }`, world snapshots, etc.
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
- Connection handshake: client sends `{type:"join", name}` and receives a
  `{type:"welcome", id}` response before gameplay messages flow.

## 7. Server Design
- **Stack:** Node.js 20, TypeScript, `ws`, `express`.
- **Modules:**
  - `players/` – tracks connections, positions, and stats.
  - `world/` – loads/generates realm tiles and spawns enemies.
  - `skills/` – validates skill casts and applies damage.
  - `chat/` – relays chat and system messages.
- **Persistence:** Postgres stores player data, Redis handles pub/sub, Milvus
  records vector memories. Connection strings are supplied via `.env`.
- **Game Loop:** tick at 60 Hz, broadcasting entity positions and events.
- **Testing:** Vitest suites cover message handlers and world generation.

## 8. Asset Requirements
Assets live under `client/assets`.

### 8.1 Images
=======
```

## 3. Build & Run
1. Install LÖVE 11.x.
2. From `client/` run `love .` to launch the game.
3. To package, zip the `client` folder contents and rename to `game.love`.
4. Distribute by concatenating the `game.love` file with platform‑specific `love` binaries or using tools like
   [love-release](https://github.com/pfirsich/love-release).

## 4. Main Modules
### 4.1 main.lua
- Loads config, seeds RNG, initializes `StateStack`.
- Establishes WebSocket connection to `ws://localhost:8080`.
- Pushes `PlayState`.

### 4.2 StateStack
- Simple stack managing current state.
- Each state defines `enter`, `update(dt)`, `draw`, `keypressed`, and `mousepressed`.
- Useful states: `PlayState`, `ForgeState`, `TestState`, `LoadingState`.

### 4.3 Networking
- Implemented via [`lua-websockets`](https://github.com/lipp/lua-websockets).
- Outgoing messages: player join/leave, movement, skill casts, chat.
- Incoming messages: world snapshots, other player positions, enemy spawns, chat logs.
- Messages encoded as JSON using `dkjson` or similar library.
- Exponential backoff reconnects on disconnect.

### 4.4 Rendering & Camera
- Use `love.graphics.translate` for camera positioning.
- Tile-based maps loaded from generated world chunks; each chunk is 1024×1024.
- Spritesheets for players/enemies animated with quads.
- UI elements drawn last using a fixed projection.

### 4.5 Input
- WASD / arrow keys: movement.
- Left click: move/attack toward cursor.
- Right click or Space: basic attack.
- `1`/`Q`, `2`/`E`, `3`/`R` for skills; **C** toggles chat.
- Input is processed in `love.update` and forwarded to networking module.

### 4.6 UI
- Immediate mode widgets rendered in `love.draw`.
- `chat.lua` handles text entry; when focused, it intercepts keyboard events.
- `skillbar.lua` displays skill icons and cooldown arcs.
- `console.lua` shows log output and WebSocket status.

### 4.7 Forge Tools
- Forge editor runs in a browser at `http://localhost:5173/forge` and communicates with the server.
- LÖVE client can open Forge state for live testing of tiles and enemies using the same modules as Play state.

## 5. Asset Requirements
A consistent art and audio set is required for the LÖVE client. Assets live under `client/assets`.

### 5.1 Images
>>>>>>> main
| Asset | Size | Notes |
|-------|------|------|
| Player spritesheet (idle, walk, shoot) | 256×256 | 8‑directional frames |
| Enemy spritesheets (goblin, skeleton, etc.) | 256×256 each | include attack and death frames |
<<<<<<< HEAD
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
=======
| Projectile sprites (magic missile, nova ring) | 64×64 | with transparency |
| Tilesets for biomes (forest, desert, ruins) | 1024×1024 per tile | generated via Stable Diffusion |
| UI elements (skill icons, chat window, buttons) | varies | PNG with alpha |
| Cursor image | 32×32 | optional custom cursor |

### 5.2 Audio
| Asset | Length | Notes |
|-------|--------|------|
| Footstep loop | ~1s | separate grass/stone variants |
| Magic missile cast | ~0.5s | |
| Arcane nova detonation | ~1s | |
| Enemy hit/Death sounds | ~0.5s each | |
| Ambient music loop | 60‑90s | per biome |
| UI click/confirm sounds | <0.3s | |

### 5.3 Fonts
- Bitmap font for UI (16px and 32px sizes).
- Monospace font for dev console.

## 6. Integration with Server
1. On `love.load` the client requests a session ID from `/join` REST endpoint or through the WebSocket handshake.
2. The server tracks connected players and rebroadcasts their positions.
3. Chat messages are relayed as `{ type: "chat", text, playerId }` JSON blobs.
4. Skills are validated server‑side before damage is applied.

## 7. Future Enhancements
- Implement client‑side prediction and reconciliation.
- Add mobile touch controls (love.touchpressed callbacks).
- Provide asset hot‑reload for faster iteration during development.

## 8. References
- LÖVE wiki: https://love2d.org/wiki/Main_Page
- lua-websockets: https://github.com/lipp/lua-websockets
- dkjson: http://dkolf.de/src/dkjson-lua.fsl/home

>>>>>>> main
