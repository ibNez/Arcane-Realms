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

> **TODO:** Specify the JSON schema and versioning approach for exported tiles.

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

> **TODO:** Clarify how new components are added to the library and synced with the database.

## Asset Sheet Integration
- A single static image contains all component sprites with predefined
  coordinates
- The editor slices components based on their location in the sheet
- Sliced assets feed Stable Diffusion prompts to generate themed variants
- Generated pieces remain aligned to the grid for seamless square assembly

> **TODO:** Describe how asset variations are cached and reused across sessions.

## Future Enhancements
- Connect multiple squares to build larger test scenes
- Save/load layouts for regression testing
- Batch-generate random squares to stress test decoration themes

> **TODO:** Investigate collaboration features for multiple designers editing the same scene.
