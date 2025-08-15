# Environment Builder & Test Tool

## Overview
The environment builder is a standalone editor for assembling and validating
grid-based world segments before integrating them into gameplay. It provides a
controlled sandbox where designers can spawn components, experiment with
decoration themes, and ensure every square connects cleanly to its neighbors.

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

## Component Library
The test tool should expose the core pieces used in world generation:
- Trees and bushes
- Walls and fences
- Houses and doors
- Treasure chests and torches
- Corn fields and farm equipment
- Additional decorative or functional items as needed

## Asset Sheet Integration
- A single static image contains all component sprites with predefined
  coordinates
- The editor slices components based on their location in the sheet
- Sliced assets feed Stable Diffusion prompts to generate themed variants
- Generated pieces remain aligned to the grid for seamless square assembly

## Future Enhancements
- Connect multiple squares to build larger test scenes
- Save/load layouts for regression testing
- Batch-generate random squares to stress test decoration themes
