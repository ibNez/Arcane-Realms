# Design Specification

This document outlines the game design for Arcane Realms.

## Input & Controls

- **Movement**: Players can move using **WASD** or by **clicking** on the ground to set a destination. Pressing a movement key cancels any click‑to‑move target.
- **Targeting**: Clicking on an enemy locks it as the current target. Press **Tab** to cycle through nearby targets. Without a lock, skills either auto‑select the nearest enemy or fire in the direction the player is moving.
- **Skills**: Skills are bound to number keys (1–4) and letters (Q/E/R/F) by default. Each skill has its own cooldown and visual telegraph. 
    - **1 / Q – Magic Missile**: fires a homing projectile at the locked target or forward if no lock.
    - **2 / E – Arcane Nova**: an area‑of‑effect explosion centered on the player with a short wind‑up and knockback.
    - **3 / R – Heal**: restores health; long cooldown.
    - **4 / F – Mobility** (future): dash or blink to reposition.
- **Combat**: Left‑clicking on an enemy both locks the target and immediately casts skill 1. Right‑clicking (or Space) will trigger a basic attack. Holding modifiers will be used for advanced skills later.

## Camera & View

The game uses a fixed top‑down camera. The camera follows the player smoothly and zooms in/out based on context (e.g., zoom out slightly when many enemies spawn).

## HUD & UI

- **Health bar**: displayed at the bottom of the screen; turns red when low.
- **Skill bar**: four slots with cooldown overlays and optional keybind labels.
- **Target indicators**: a ring around the locked target and a floating health bar above each enemy.
- **Chat panel**: toggled with **C**, used to talk to NPCs; integrates with the AI service.
- **Dev console**: toggled with **~** for debugging; captures logs and errors.

## Procedural World

- The world is constructed from **zones**, each composed of procedurally generated **cells**. 
- Each zone contains multiple **biomes** (forest, ruins, caves) with unique spawners and enemy types.
- Cells are generated deterministically from a seed, so players can explore the same world state across sessions.
- **Instancing** allows the server to spin up copies of high‑density areas (dungeons, boss arenas).

## Enemies & Combat Design

- Enemies have simple finite state machines (FSMs): **Idle → Pursue → Wind‑up → Attack → Recover**.
- Enemies telegraph attacks with visual cues (glows, wind‑up animations) to give players time to react.
- Enemy hit points and damage scale based on zone difficulty.
- Bosses and elites have unique patterns and may require cooperative tactics.

## Skills & Abilities

- Each class will have a unique skill kit. For the MVP we implement a **Mage** archetype:
    - **Magic Missile**: homing single‑target projectile.
    - **Arcane Nova**: radial AoE with knockback.
    - **Heal**: burst heal with long cooldown.
    - **Blink** (planned): short‑range teleport granting invulnerability during travel.
- Skills cost **mana** (to be added in later milestones) and have individual cooldowns.
- Future classes (Warrior, Ranger, Summoner) will bring melee combos, ranged volleys, and minion control.

## AI‑Driven NPCs

- NPCs use **Ollama** via the server’s `/llm` endpoint for natural language dialogue.
- Each NPC has a **persona prompt**, context about the world, and access to a **function‑calling schema** to perform game actions (grant quests, unlock skills, give lore).
- NPC memory is stored in **Milvus**; queries retrieve relevant dialogue history or lore to inform responses.
- STT (Whisper) and TTS (Piper) are used to enable voice chat with NPCs when available.

## Breeding & Wildlife

- Creatures in the world have **genomes** with heritable traits (size, speed, elemental affinity).
- **Breeding**: Players can capture creatures and combine two to produce offspring with blended traits and random mutations.
- **Wild breeding**: The world continues to evolve without the player; creatures within the same cell mate periodically. 
- **Lineage tracking**: Each creature’s ancestry is stored in Milvus so players can discover unique lines.

## Multiplayer

- Multiplayer uses a shared **zone server**; each client receives updates only for entities in their **interest cell**.
- **Client prediction** ensures responsive controls; the server reconciles authoritative positions.
- Future features include co‑op dungeons, PvP arenas, and social hubs.

## Art & Audio Direction

- Visual style: low‑poly 3D or pixel‑art sprites rendered in isometric/orthographic projection. We aim for readability over hyper‑realism.
- Sound: crisp spell effects, subtle ambient loops, dynamic music that ramps up during combat. Optional voice for NPCs.
- Effects: particles, shaders for glows, hit flashes, knockback trails; avoid excessive screen shake.

## Roadmap & Future Enhancements

See `docs/ROADMAP.md` for milestone planning and tasks.
