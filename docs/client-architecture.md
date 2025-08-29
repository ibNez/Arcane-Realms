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

## State Management
Arcane Realms currently relies on a small custom `StateStack` to handle screen transitions.  It keeps dependencies light and
the API straightforward while the client only has a few states.

### Migrating to `hump.gamestate`
If the number of states grows and we decide to adopt [`hump.gamestate`](https://github.com/vrld/hump/blob/master/gamestate.lua),
follow these steps:
1. Vendor or install `gamestate.lua` and require it from `main.lua`.
2. Refactor each module in `states/` to expose the callbacks expected by `hump.gamestate` (`init`, `enter`, `leave`, `update`,
   `draw`).
3. Replace the custom stack logic in `main.lua` with calls to `Gamestate.switch`, `push`, and `pop`.
4. Remove the old `StateStack` implementation and any references to it.
5. Test transitions between `PlayState`, `ForgeState`, `TestState`, and any new states to confirm behavior matches the previous
   system.

## Networking
The client connects to the Node.js server at `ws://localhost:8080`:
1. `net/websocket.lua` opens a WebSocket and registers callbacks.
2. Input events (movement, skills, chat) serialize to JSON and send over the socket.
3. Incoming messages update world entities or append to chat.
4. Reconnection logic attempts exponential backoff when the socket closes.

### Message Formats

Client → Server:

```json
{ "t": "move", "x": 10, "y": 20 }
{ "t": "chat", "text": "hello" }
{ "t": "skill", "id": "magic_missile", "target": 123 }
```

Server → Client:

```json
{ "t": "pos", "id": "player1", "x": 10, "y": 20 }
{ "t": "chat", "id": "player1", "text": "hello" }
```

For a complete list of planned message fields and types, see
[ws-schemas.md](ws-schemas.md).

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

## Error Handling & Logging
`love.errhand` is hooked to capture runtime errors and print them to the console. Socket disconnects and retries are surfaced in
red via the dev console so testers can spot flaky connections.

In addition to the on‑screen console, logs are written to `client.log` under a `logs/` directory inside the LÖVE save
directory (see `love.filesystem.getSaveDirectory`). The file rotates when it reaches ~1 MB, keeping the five most recent
archives so disk usage stays bounded across sessions.

## Open Items
- **Message schemas** – see [ws-schemas.md](ws-schemas.md) for inventory updates and complex skill payloads.
