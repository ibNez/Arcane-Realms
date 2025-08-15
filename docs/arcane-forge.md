# Arcane Forge Development Environment

## Overview
**Arcane Forge** is the local development environment for Arcane Realms. It
brings together the tools needed to build and test new features, including
character creation and world assembly. This document explains how to set up and
use Arcane Forge while highlighting the areas that require focused testing.

## Prerequisites
- **Node.js v20.x** and npm
- **Git**
- **Docker** and **docker-compose** for optional offline AI services
- A **GPU** is recommended when running large models locally

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
The world is assembled from **Realm Tiles** – square 200 m × 200 m areas composed
of 10 × 10 20 m chunks. When a player reaches a tile edge, the next tile is
created and stitched seamlessly to the current one. Outer tiles belong to
progressively harder "rings" radiating from the starting tile; enemies and
resources scale with distance, encouraging players to grow before venturing
outward.

## Environment Design Tools
To author Realm Tiles, designers use an Inkarnate-style editor (see
[environment-builder.md](environment-builder.md)). The editor must support:

- Layer-based drawing with brushes and texture fills
- Drag-and-drop placement from a component library
- Snap-to-grid alignment and freeform painting modes
- Export/import of tile data for version control and sharing
- Previewing neighboring tiles to verify seamless borders

## Additional Resources
- [Test Area](test-area.md) – sandbox for validating combat and movement within a
  single tile
- [SETUP.md](SETUP.md) – more detailed machine setup instructions

