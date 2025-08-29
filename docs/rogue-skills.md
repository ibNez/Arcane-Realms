# Rogue Skills Design

## Overview
Rogues specialize in precision strikes, stealth tactics, and rapid repositioning. They rely on **Energy** to unleash bursts of damage while avoiding counterattacks.

### Class Characteristics
- **Primary Attribute:** Dexterity (DEX)
- **Resource:** Energy – regenerates quickly over time
- **Range:** Melee
- **Role:** Damage Dealer (DPS)

## Skill List

| Rank | Skill Name    | Description                              | Skill Type        |
| ---- | ------------- | ---------------------------------------- | ----------------- |
| 1    | Backstab       | High damage from behind                   | Offense (Damage)  |
| 2    | Poisoned Blade | Applies damage-over-time toxin            | Offense (Debuff)  |
| 3    | Shadowstep     | Teleports behind target                   | Mobility          |
| 4    | Smoke Bomb     | AoE blind, reduces enemy accuracy         | Control           |
| 5    | Evasion        | Temporarily increases dodge chance        | Defense           |
| 6    | Fan of Knives  | Throws knives in a cone                   | Offense (AoE)     |

## Skills
### Backstab
- **Cooldown:** 3 s
- **Damage:** `12 + 3 * DEX`
- **Energy Cost:** 25
- **Details:** Deals double damage when striking from behind.

### Poisoned Blade
- **Cooldown:** 8 s
- **Energy Cost:** 20
- **Details:** Coats weapon in poison, causing `5 + 1 * DEX` damage per second for 6 s.

### Shadowstep
- **Cooldown:** 10 s
- **Energy Cost:** 15
- **Range:** 6 m
- **Details:** Instantly appears behind target and gains 1 s of stealth.

### Smoke Bomb
- **Cooldown:** 18 s
- **Energy Cost:** 30
- **Area:** 4 m radius
- **Details:** Blinds enemies for 4 s, reducing their hit chance by 50%.

### Evasion
- **Cooldown:** 20 s
- **Energy Cost:** 25
- **Duration:** 6 s
- **Details:** Increases dodge chance by 40%.

### Fan of Knives
- **Cooldown:** 12 s
- **Damage:** `7 + 1 * DEX` per knife
- **Energy Cost:** 35
- **Details:** Throws knives in a 90° cone hitting all targets.

## Strategic Function
- Excels at burst damage and finishing weakened foes.
- Disrupts enemies with poisons and control tools.
- Provides scouting and utility through stealth abilities.

## Acceptance Criteria
- Positional bonuses apply correctly for Backstab.
- Smoke Bomb and Evasion modify enemy accuracy and dodge chance.
- Energy regeneration supports continuous skill usage.
