# Asset Catalog

## Overview
The asset catalog tracks reusable game objects for the component library. Each
entry includes visual and gameplay metadata so assets can be referenced
consistently across tools and the runtime.

Assets use lowercase names with underscores (e.g., `oak_tree.png`). Prefix the
category when helpful (`tree_oak.png`, `wall_stone.png`). Tag assets with the
biomes they appear in and an approximate rarity (`common`, `uncommon`, `rare`).

## Asset Fields
| Image | Name | Description | Dimensions (px) | Object Type | Default Collision | Biomes | Rarity |
|-------|------|-------------|-----------------|-------------|-------------------|--------|--------|
| `oak_tree.png` | Oak Tree | Standard deciduous tree used in forest biomes. | 128×256 | vegetation | true | forest | common |
| `stone_wall.png` | Stone Wall | Modular wall segment for towns and dungeons. | 64×128 | structure | true | all | common |
| `campfire.png` | Campfire | Small decorative fire source. | 32×32 | decorative | false | all | uncommon |

Additional columns (tags, interactive properties) can be added as needed.

## SQLite Storage
Asset metadata is stored in a lightweight SQLite database for use by the
component library and runtime systems.

When the schema changes, create a migration under `ops/migrations` and update
the application to run migrations on startup.

```sql
CREATE TABLE assets (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_path TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    object_type TEXT NOT NULL,
    default_collision INTEGER NOT NULL CHECK (default_collision IN (0,1)),
    biomes TEXT,
    rarity TEXT
);
```

A CLI tool (`ops/sync-assets.js`) will sync `asset-catalog.md` with the SQLite
database by parsing the markdown and inserting or updating rows.

## Usage
The environment builder and world generation pipelines read from the SQLite
database to retrieve asset definitions. See the referenced documents for how
assets are applied in each system.
