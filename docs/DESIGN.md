# Design Specification

This document outlines the game design for Arcane Realms.

#### AI‑Driven NPCs

### Core AI Systems
- NPCs use **Ollama** via the server's `/llm` endpoint for natural language dialogue.
- Each NPC has a **persona prompt**, context about the world, and access to a **function‑calling schema** to perform game actions (grant quests, unlock skills, give lore).
- NPC memory is stored in **Milvus**; queries retrieve relevant dialogue history or lore to inform responses.
- STT (Whisper) and TTS (Piper) are used to enable voice chat with NPCs when available.

### Quest System & Player Tracking
- **Cross-Player Awareness**: Quest-giving NPCs maintain awareness of all players who have accepted their quests
- **Dynamic Dialogue**: NPCs will mention other players by name during quest conversations ("Ah, I see you're here about the missing artifacts too, just like Adventurer Sarah was yesterday...")
- **Competitive Quests**: Some high-value quests can only be completed by the first player to turn them in
- **Quest Status Updates**: NPCs track and reference the progress of multiple players on the same quest
- **Social Dynamics**: NPCs may express preferences for certain players based on past interactions and quest completion history

### Dynamic Quest Generation
- **Emergent Content**: New NPCs periodically appear in established regions with fresh quests and storylines
- **Regional Expansion**: As areas develop, new questgivers emerge to extend adventures and provide ongoing content
- **Adaptive Storytelling**: New quests reference previous player actions and regional history
- **Seasonal Events**: Special NPCs may appear during certain conditions or time periods
- **Community Impact**: Quest outcomes from multiple players influence what new NPCs and quests become available

### NPC Daily Routines & Behaviors
- **Town Life Simulation**: NPCs in settlements follow realistic daily schedules and routines
- **Pathfinding & Movement**: NPCs travel between locations (home, work, market, tavern) based on time of day and personal schedules
- **Dynamic Positioning**: Players will find NPCs in different locations throughout the day, making towns feel alive
- **Routine Variation**: NPCs occasionally deviate from routines for special events or random activities

### Inter-NPC Social Interactions
- **Autonomous Conversations**: NPCs engage in brief conversations with each other when paths cross
- **Relationship Dynamics**: NPCs maintain relationships with each other (friends, rivals, family, business partners)
- **Gossip & Information Exchange**: NPCs share information about players, world events, and local news during conversations
- **Behavioral Consistency**: NPC-to-NPC interactions reflect their established personalities and relationships
- **Player Observation**: Players can overhear these conversations, potentially gaining quests, lore, or hints

### Advanced NPC Features
- **Memory Persistence**: NPCs remember past interactions across sessions and reference them in future conversations
- **Emotional States**: NPCs exhibit varying moods that affect their dialogue and quest offerings
- **Reputation System**: NPCs react differently to players based on their reputation and past actions
- **Economic Participation**: NPCs buy/sell items, creating dynamic market conditions in towns
- **Conflict Resolution**: NPCs may have disputes that players can mediate or influence

> **📖 For detailed technical specifications**, see `docs/npc-systems.md` & Controls

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

### World Generation Philosophy
The world of Arcane Realms is **player-driven and dynamically generated**. Rather than a pre-built static world, the game world expands and evolves as players explore, creating a living, breathing environment that grows organically through gameplay.

### Core World Structure
- The world is constructed from **zones**, each composed of procedurally generated **cells**. 
- Each zone contains multiple **biomes** (forest, ruins, caves) with unique spawners and enemy types.
- Cells are generated deterministically from a seed, so players can explore the same world state across sessions.
- **Instancing** allows the server to spin up copies of high-density areas (dungeons, boss arenas).

### Player-Driven World Expansion
- **Exploration Triggers Generation**: New areas are created when players venture beyond existing boundaries
- **Discovery Mechanics**: Players actively discover new locations, landmarks, and secrets through exploration
- **Collective World Building**: All players contribute to the same persistent world; discoveries by one player become part of the shared experience
- **Dynamic Content**: Points of interest, dungeons, and special locations are generated based on player actions and exploration patterns

### World Growth Rate Limiting
To maintain server performance and ensure quality content generation:

- **Generation Throttling**: New world segments are generated at a controlled rate to prevent server overload
- **Queue System**: Exploration requests beyond current capacity are queued and processed in order
- **Priority Zones**: Areas with higher player interest receive generation priority
- **Cleanup Mechanisms**: Unused or rarely visited areas may be archived to free up resources
- **Expansion Caps**: Daily/weekly limits on total world growth to maintain manageable world size

### Dynamic World Features
- **Emergent Storytelling**: The world's history is written by player actions and discoveries
- **Seasonal Changes**: World areas may evolve over time based on player activity and in-game events
- **Hidden Discoveries**: Secret areas, rare resources, and unique encounters emerge through exploration
- **Adaptive Difficulty**: New areas scale appropriately based on the skill level of discovering players
- **Cross-Player Impact**: Actions in one area may influence the generation of connected regions

### Technical Considerations
- **Seamless Loading**: New areas generate behind-the-scenes to provide smooth exploration
- **Memory Management**: Intelligent caching and unloading of world segments based on player proximity
- **Persistence**: All generated content is saved and remains consistent across sessions
- **Rollback Protection**: Safeguards prevent loss of discovered content due to technical issues

> **📖 For detailed technical specifications**, see `docs/world-generation.md`

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
