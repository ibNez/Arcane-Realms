# Asset Catalog

## Overview
The asset catalog tracks reusable game objects for the component library. Each entry includes visual and gameplay metadata so assets can be referenced consistently across tools and the runtime.

## Asset Fields
| Image | Name | Description | Dimensions (px) | Object Type | Default Collision |
|-------|------|-------------|-----------------|-------------|-------------------|
| `oak_tree.png` | Oak Tree | Standard deciduous tree used in forest biomes. | 128×256 | vegetation | true |
| `stone_wall.png` | Stone Wall | Modular wall segment for towns and dungeons. | 64×128 | structure | true |
| `campfire.png` | Campfire | Small decorative fire source. | 32×32 | decorative | false |

Add new rows as assets are created. Image paths are relative to the project root.

## SQLite Storage
Asset metadata is stored in a lightweight SQLite database for use by the component library and runtime systems.

```sql
CREATE TABLE assets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    object_type TEXT NOT NULL,
    default_collision INTEGER NOT NULL CHECK (default_collision IN (0,1))
);
```

Populate the table from `asset-catalog.md` or import directly via tooling. The database file lives under `ops/data/assets.db` and is loaded at startup by the component library.

## Usage
The environment builder and world generation pipelines read from the SQLite database to retrieve asset definitions. See the referenced documents for how assets are applied in each system.
