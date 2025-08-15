# Test Area

The Test Area is a dedicated playground for validating character abilities and enemy behavior before integrating features into the full game. It launches automatically when the client starts and exposes tools for spawning enemies, toggling AI, and testing skills.

> **TODO:** Describe logging or telemetry options for capturing test metrics.

## Launching
1. Start the server and client as described in [SETUP.md](SETUP.md).
2. Open `http://localhost:5173` in a browser. The **TestScene** loads by default.

## Controls
- **Movement:** WASD or arrow keys
- **Left click:** move to cursor; click an enemy to lock and fire a Magic Missile
- **Right click:** free-aim shot for debugging
- **Skill 1 — Magic Missile:** press `1` or `Q` (homing projectile, 500 ms cooldown)
- **Skill 2 — Arcane Nova:** press `2` or `E` (AoE with telegraph, 1500 ms cooldown)
- **Tab:** cycle locked target
- **C:** toggle chat panel
- **`** (backtick): toggle dev console

> **TODO:** Include controller and mobile input mappings for completeness.

## Control Panel
A DOM panel titled **Test Controls** appears in the upper-left and provides buttons to manipulate the scene:
- **Spawn Enemy** – add one enemy at the test marker
- **Spawn 5 Enemies** – stress test with five spawns
- **Toggle AI (pursuit)** – pause or resume enemy movement
- **Clear Enemies** – remove all enemies and loot
- **Reset Player** – center the player and restore HP
- **Invincible** – toggle player damage intake
- **Slow-mo** – toggle time scale for debugging

> **TODO:** Document network simulation tools (latency, packet loss) for multiplayer testing.

## Focus
Until core character functionality is complete, all interaction features should be implemented and validated in this Test Area. Use it to iterate quickly on combat, abilities, and enemy AI before promoting changes to other scenes.

> **TODO:** Clarify how test results should be recorded and shared among team members.
