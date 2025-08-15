# Development Environment Requirements

## Overview
The development environment defines how Arcane Realms is built and tested. It
covers the tools used to design world segments, the structure of those segments,
and the quality checks applied before features reach players.

## Realm Tiles
The world is assembled from **Realm Tiles** – square 200 m × 200 m areas composed
of 10 × 10 20 m chunks. When a player reaches a tile edge, the next tile is
created and stitched seamlessly to the current one. Outer tiles belong to
progressively harder "rings" radiating from the starting tile; enemies and
resources scale with distance, encouraging players to grow before venturing
outward.

## Environment Design Tools
To author Realm Tiles, designers use an Inkarnate-style editor (see
[environment-builder](environment-builder.md)). The editor must support:

- Layer-based drawing with brushes and texture fills
- Drag-and-drop placement from a component library
- Snap-to-grid alignment and freeform painting modes
- Export/import of tile data for version control and sharing
- Previewing neighboring tiles to verify seamless borders

## Testing Focus
Development requires targeted testing to maintain quality:

- **Character Creation** – Unit tests validate parameter parsing, prompt
  construction, generation queue behavior, caching, and fallbacks. See
  [character-creation](character-creation.md#testing-requirements).
- **Realm Tile Integration** – Ensure new tiles connect without visible seams and
  that difficulty scaling matches the current ring.
- **Test Scene** – The [test area](test-area.md) provides a sandbox for
  validating combat and movement within a single tile.

