# Client Architecture (LÖVE)

This document outlines the structure of the LÖVE client used by Arcane Realms.

## Module Layout
- **main.lua** – entry point. Loads configuration, initializes subsystems, and pushes the initial state.
- **states/** – gameplay states implemented with a simple stack (e.g., `PlayState`, `ForgeState`, `TestState`). Each state
  implements `enter`, `update(dt)`, `draw()`, and `exit`.
- **net/** – WebSocket wrapper built on [`lua-websockets`](https://github.com/lipp/lua-websockets) handling connection,
  message dispatch, and reconnection.
- **ui/** – immediate‑mode UI widgets (chat panel, skill bar, dev console) rendered in `love.draw`.
- **assets/** – spritesheets, sound effects, music loops, and fonts loaded at startup via `love.graphics.newImage` and
  `love.audio.newSource`.

```
client/
├── main.lua
├── states/
│   ├── play.lua
│   ├── forge.lua
│   └── test.lua
├── net/
│   └── websocket.lua
├── ui/
│   ├── chat.lua
│   ├── skillbar.lua
│   └── console.lua
└── assets/
    ├── images/
    ├── sounds/
    └── fonts/
```

## Game Loop
`love.load` bootstraps assets and pushes `PlayState` onto the stack. The `StateStack` routes `love.update` and `love.draw`
callbacks to the active state. States may push another state (e.g., opening the Forge editor) or pop themselves when complete.

## Networking
The client connects to the Node.js server at `ws://localhost:8080`:
1. `net/websocket.lua` opens a WebSocket and registers callbacks.
2. Input events (movement, skills, chat) serialize to JSON and send over the socket.
3. Incoming messages update world entities or append to chat.
4. Reconnection logic attempts exponential backoff when the socket closes.

## Input Flow
```
Keyboard/Mouse → love callbacks → Active State → WebSocket → Server
```
WASD controls movement; left click issues move/attack commands; pressing **C** toggles the chat panel which captures text input.

## Extending the Client
### Adding a State
1. Create a module under `states/` returning a table with `enter`, `update`, `draw`, and `exit`.
2. Require it in `main.lua` and push the state when needed.
3. Use the networking and UI helpers as required.

### Adding a Skill
1. Define the skill logic in `states/play.lua` (cast, cooldown, visuals).
2. Add an entry to the `SkillBar` UI and bind a key in `love.keypressed`.
3. Emit a network message if the skill affects other players.

## Notes
- The client uses a minimal custom `StateStack`; no third‑party library is required.
- Errors and socket failures are surfaced in `console.lua` via `pcall` and status messages.
- JSON message schemas are documented in `docs/API.md`.
