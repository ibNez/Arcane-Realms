# Arcane Forge Development Environment

## Overview
**Arcane Forge** is the local development environment for Arcane Realms. It
brings together the tools needed to build and test new features, including
character creation and world assembly. This document explains how to set up and
use Arcane Forge while highlighting the areas that require focused testing.

> **TODO:** Provide architecture diagrams showing how client and server components interact during development.

## Prerequisites
- **Node.js v20.x** and npm
- **Git**
- **Docker** and **docker-compose** for optional offline AI services
- A **GPU** is recommended when running large models locally
> **TODO:** Clarify supported operating systems and any platform-specific caveats for these prerequisites.

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
- **Client**: http://localhost:5173
> **TODO:** Describe how environment variables are managed during local development and testing.

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
> **TODO:** Document tools or scripts used to generate and validate Realm Tiles automatically.

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
> **TODO:** Add guidance on exporting/importing tile data formats and version control strategies.

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

