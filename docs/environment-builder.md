# Environment Builder & Test Tool

## Overview
The environment builder is a standalone editor for assembling and validating
grid-based world segments called **Realm Tiles** before integrating them into
gameplay. Each tile is derived from a **1024 × 1024** Stable Diffusion image and
represents a 64 × 64 grid (1 cell = 16 px = 5 ft). This yields **320 ft per side**
for a single tile. Designers layer objects like walls, hills, trees, bushes,
houses, and characters on top. Objects carry metadata (e.g., collision on/off)
so they can be easily toggled during testing. The tool provides a controlled
sandbox where designers can spawn components, experiment with decoration themes,
and ensure every square connects cleanly to its neighbors. To prototype a play
space of ~1000 ft per side, combine tiles in a **4 × 4 grid** (16 tiles total).

Built with **Phaser** for rendering, **React** for the interface, and **Vite** with TypeScript for bundling. The editor runs in modern browsers such as Chrome 118+, Firefox 115+, Safari 17+, and Edge 118+.

## Goals
- Run independently from the main application, similar to character testing
- Focus on a single world square while preserving connections to adjacent
  squares
- Rapidly place, manipulate, and evaluate environment components
- Use generated art sheets to seed Stable Diffusion for themed decoration

## Test Environment Creator
- Launches as an `EnvironmentTestScene` separate from production scenes
- Renders one grid square with snap-to-grid placement
- Includes a control panel for spawning and managing components
- Supports quick iteration without affecting saved game data

### Control Panel Features
- **Add Component** button with selectable component list
- **Zoom In/Out** controls for detailed editing
- **Select Item** mode for moving or inspecting objects
- **Delete Item** to remove selected components
- **Drag & Duplicate** for rapid placement of multiples
- **Snap to Grid** toggle for precise alignment

The canvas opens empty to encourage fresh layouts. Selecting **Add Component**
slides the component library up from the bottom of the screen. Drag any entry
from this panel onto the canvas to place it; holding **Alt** while dragging an
existing object creates a duplicate.

| Control | Shortcut | UI Behavior |
|---------|----------|-------------|
| Add Component | **A** | Opens the component palette with search focus. |
| Zoom In/Out | Mouse wheel or **+ / -** | Zooms around the cursor and updates the grid scale indicator. |
| Select Item | **S** | Highlights the hovered object and enables movement handles. |
| Delete Item | **Del** or **Backspace** | Removes the currently selected component. |
| Drag & Duplicate | **Alt + Drag** | Creates a copy of the dragged component. |
| Snap to Grid | **G** | Toggles grid snapping and reflects state in the toolbar icon. |

### Realm Tile Composition
- Start with a single 1024 × 1024 seamless ground tile
- Layer components from the library on top of the background
- Assign metadata to each object, including collision detection on/off
- Export to and import from JSON for source control

Exported tiles follow a structured JSON schema:

```json
{
  "version": "1.0.0",
  "background": "assets/tiles/grassland.png",
  "grid": { "rows": 64, "cols": 64, "cellSize": 16 },
  "objects": [
    {
      "id": "uuid",
      "type": "tree.oak",
      "x": 12,
      "y": 34,
      "rotation": 0,
      "metadata": { "collision": false }
    }
  ]
}
```

- `version` uses semantic versioning and increments on schema changes.
- Importers migrate older versions and refuse unsupported future major versions, ensuring compatibility as the format evolves.

## Component Library
The test tool exposes the core pieces used in world generation. Components are
layered over the background image and include metadata, such as whether
collision is enabled. The authoritative list of components lives in
[asset-catalog.md](asset-catalog.md) and is mirrored in a SQLite database
(`ops/data/assets.db`) that the editor reads on startup:
- Trees and bushes
- Walls and fences
- Houses and doors
- Treasure chests and torches
- Corn fields and farm equipment
- Additional decorative or functional items as needed

To add a new component to the library:

1. Place the sprite on the shared asset sheet or drop an image into `assets/`.
2. Append a row describing it in [asset-catalog.md](asset-catalog.md).
3. Rebuild the SQLite cache so the editor can load it:

   ```bash
   node ops/asset-sync.mjs  # reads the catalog and updates ops/data/assets.db
   ```

   (A manual `sqlite3` import into `ops/data/assets.db` works as well.)
4. Restart the environment builder; it reads the refreshed database on startup.

## Asset Sheet Integration
- A single static image contains all component sprites with predefined
  coordinates
- The editor slices components based on their location in the sheet
- Sliced assets feed Stable Diffusion prompts to generate themed variants
- Generated pieces remain aligned to the grid for seamless square assembly

Generated variants are cached on disk using a hash of the source sprite and the
prompt used to generate it. On startup the editor checks this cache and reuses
matching entries instead of calling Stable Diffusion again, keeping visuals
consistent while speeding up repeat sessions.

## Future Enhancements
- Connect multiple squares to build larger test scenes
- Save/load layouts for regression testing
- Batch-generate random squares to stress test decoration themes

## Collaboration and Version Control
Supporting multiple designers on a single scene can follow several patterns:

- **Real-time synchronization** – a shared server relays state via WebSockets or WebRTC. Libraries based on CRDTs (e.g., Yjs, Automerge) merge edits from each client without conflicts.
- **Operational-transform workflows** – clients send user operations to a coordinator that rebases them in sequence, similar to Google Docs style editing.
- **Version-control model** – treat each tile's JSON as code: designers branch, commit, and open pull requests. Git LFS or a lightweight binary store manages large assets while reviews ensure quality.
- **Hybrid approach** – live sessions for quick iteration backed by Git history to audit changes, roll back mistakes, and reconcile diverging branches.
