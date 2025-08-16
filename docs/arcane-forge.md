# Arcane Forge Development Environment

## Overview
**Arcane Forge** is the local development environment for Arcane Realms. It
brings together the tools needed to build and test new features, including
character creation and world assembly. This document explains how to set up and
use Arcane Forge while highlighting the areas that require focused testing.

During development the Vite-powered client communicates with the Node.js
server over HTTP and WebSocket channels. The client performs hot-module reloads
and submits API calls, while the server exposes REST routes and live game
state for rapid iteration.

![Client–server development flow](images/arcane-forge-overview.svg)

## Prerequisites
- **Node.js v20.x** and npm
- **Git**
- **Docker** and **docker-compose** for optional offline AI services
- A **GPU** is recommended when running large models locally
Arcane Forge is tested on Windows 10/11, macOS 12+, and modern Linux distributions
such as Ubuntu 20.04+ and Fedora 38+. Platform-specific notes:

- **Windows:** Use WSL 2 for a Linux-compatible environment. Install Node.js and
  Git via `winget` or Chocolatey, and enable Docker Desktop with WSL 2 or
  Hyper-V. GPU workloads require current NVIDIA drivers.
- **macOS:** Install Node.js, Git, and Docker Desktop through Homebrew. Apple
  Silicon systems may need Rosetta for x86-only tools.
- **Linux:** Install Node.js and Git from your package manager or via `nvm`. Add
  your user to the `docker` group and ensure vendor GPU drivers are present so
  Docker can access the GPU.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/ibNez/Arcane-Realms.git
   cd Arcane-Realms
   ```
2. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. (Optional) start the offline AI stack:
   ```bash
   docker compose -f ops/docker-compose.yml up -d
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```

## Running Arcane Forge
Start the server and client in separate terminals:

```bash
# server
cd server
npm run dev

# client
cd client
npm run dev
```

- **Server**: http://localhost:8080
- **Game**: http://localhost:5173
- **Arcane Forge**: http://localhost:5173/forge
 
Server configuration values are stored in `server/.env`. Start by copying the
sample file and adjusting settings for your machine:

```bash
cp server/.env.example server/.env
```

The server loads this file on startup via `dotenv`, making each entry available
through `process.env`. Example values:

```
PORT=8080
CORS_ORIGIN=http://localhost:5173
OLLAMA_BASE_URL=http://localhost:11434
```

Client-side variables live in `client/.env` and must be prefixed with `VITE_` so
Vite exposes them to the browser. For example:

```
VITE_API_BASE_URL=http://localhost:8080
```

These values are injected at build time and accessed with
`import.meta.env.VITE_API_BASE_URL`.

## Testing

### Character Building
Run Vitest suites to verify the character creation pipeline and API routes:

```bash
cd server
npm test
```

See [character-creation.md](character-creation.md#testing-requirements) for
coverage expectations.

### Environment Building
Launch the environment editor to assemble and validate Realm Tiles. With the
client running, open the `EnvironmentTestScene` (see
[environment-builder.md](environment-builder.md)) and use the control panel to
place components, verify snap-to-grid alignment, and confirm that tiles connect
cleanly.

## Realm Tiles
The world is assembled from **Realm Tiles** — each derived from a 1024 × 1024
Stable Diffusion image mapped to a 64 × 64 grid. With 1 cell = 16 px = 5 ft, a
single tile spans **320 ft (≈100 m)** per side. Larger playable areas combine
multiple tiles; for example, a **4 × 4 tile set** covers ~1280 ft per side to meet
the 1000 ft design target. When a player reaches a tile edge, the next tile is
created and stitched seamlessly to the current one. Outer tiles belong to
progressively harder "rings" radiating from the starting tile; enemies and
resources scale with distance, encouraging players to grow before venturing
outward.
Arcane Forge includes command line utilities to batch-generate Realm Tiles and
verify that new images stitch cleanly to their neighbors. The `tilegen`
script renders tiles via Stable Diffusion and records metadata for the
environment editor, while `tilegen validate` scans a directory of tiles for
dimension, seam, and collision-map issues.

```bash
# Create a 4×4 forest set
node ops/tilegen.js generate --biome forest --count 16 --out tiles/forest

# Verify edges and metadata before committing
node ops/tilegen.js validate tiles/forest
```

## Environment Design Tools
To author Realm Tiles, designers begin with a single **seamless 1024 × 1024**
ground image—such as a field or desert—and layer objects from a component
library on top (see [environment-builder.md](environment-builder.md)). Asset
definitions originate from the shared [asset-catalog.md](asset-catalog.md)
and its companion SQLite database (`ops/data/assets.db`). Each
object includes metadata, including a collision on/off flag. The editor must
support:

- Drag-and-drop placement from the component library
- Snap-to-grid alignment
- Export/import of tile data for version control and sharing
- Previewing neighboring tiles to verify seamless borders

### Exporting and Importing Tiles
1. Select **File → Export Tile** to save the current layout as `<tile-name>.json` and a corresponding `<tile-name>.png` base image.
2. Place these files in `tiles/<biome>/` and commit them to version control.
   - Keep the JSON file in Git for readable diffs.
   - Track large images with Git LFS or another binary store.
3. To reuse a layout, choose **File → Import Tile** and pick the exported `.json`; the editor restores the tile and links to the existing image.

This workflow keeps tiles shareable while preserving history and enabling rollbacks through Git.


## Interactive Features
To prototype gameplay, Arcane Forge includes basic simulation tools:

- Drop playable characters onto the environment for layout testing
- Drop enemies into the scene to validate encounters
- Test environment objects for collision detection
- Regenerate selected objects; for example, selecting a wall and pressing
  **Generate** produces a new image from the base wall and swaps it in place
- Start and stop buttons to toggle object and enemy movement during playtests

## Additional Resources
- [Test Area](test-area.md) – sandbox for validating combat and movement within a
  single tile
- [SETUP.md](SETUP.md) – more detailed machine setup instructions

