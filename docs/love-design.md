# Arcane Realms – LÖVE Client Design

This document describes the end‑to‑end design for the LÖVE implementation of Arcane Realms. It covers
module layout, networking, asset requirements, and build instructions so contributors can recreate the
current client in native Lua.

## 1. Goals
- Native desktop client using [LÖVE 11.x](https://love2d.org/) for rendering and input.
- Reuse the existing Node.js server and WebSocket protocol.
- Preserve gameplay features (movement, combat skills, chat, Forge tools).

## 2. Directory Structure
```
client/
├── main.lua              -- entry point
├── conf.lua              -- window settings
├── core/                 -- engine helpers (state stack, timers, assets)
├── states/               -- play, forge, test
├── net/                  -- websocket client
├── ui/                   -- chat, skill bar, dev console
└── assets/               -- images/, sounds/, fonts/
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
| Asset | Size | Notes |
|-------|------|------|
| Player spritesheet (idle, walk, shoot) | 256×256 | 8‑directional frames |
| Enemy spritesheets (goblin, skeleton, etc.) | 256×256 each | include attack and death frames |
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

