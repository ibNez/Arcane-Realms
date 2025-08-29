# Arcane Realms – LÖVE Rebuild

Arcane Realms is a top‑down action RPG being rewritten from scratch using the [LÖVE](https://love2d.org/) framework.
The legacy Phaser/Node implementation now lives under [`old/`](old/) for reference only.

## Project Goals
- Native desktop client powered by LÖVE and Lua.
- Multiplayer gameplay via a lightweight server (to be reimplemented).
- Fully documented asset pipeline and offline AI stack for world and NPC generation.

### Why LÖVE?

LÖVE was selected over the former Phaser/browser stack to gain native desktop
performance and simpler packaging for Windows, macOS, and Linux. While LÖVE does
not ship with built‑in networking, libraries such as `lua-websockets` or ENet let
the client communicate with the Node.js server just as the original web client
did, preserving multiplayer features while moving out of the browser.

## Repository Layout
- `client/` – new LÖVE client (work in progress)
- `server/` – new game server (work in progress)
- `docs/` – comprehensive design, setup, and gameplay documentation
- `ops/` – Docker scripts for optional offline AI services
- `old/` – archived Phaser/Node client, server, and assets

## Development Quick Start
1. Install **LÖVE 11.x**, **Node.js 20.x**, **Git**, and **Docker**.
2. Clone the repository and review [docs/SETUP.md](docs/SETUP.md) for detailed environment instructions.
3. Implement missing modules listed in [docs/love-todo.md](docs/love-todo.md).
4. Run the LÖVE client:
   ```bash
   cd client
   love .
   ```
5. Launch the server (after implementation):
   ```bash
   cd server
   npm install
   npm run dev
   ```

## Documentation
The `docs/` folder contains everything needed to build the game:
- [love-design.md](docs/love-design.md) – full software design document
- [love-todo.md](docs/love-todo.md) – implementation checklist
- [asset-catalog.md](docs/asset-catalog.md) – required images, audio, and fonts
- [arcane-forge.md](docs/arcane-forge.md) – overview of the development environment

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and the
[ROADMAP](docs/ROADMAP.md) for long‑term plans.
