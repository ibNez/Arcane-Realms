# Paladin Skills Design

## Overview
Paladins blend martial prowess with holy magic, serving as stalwart defenders and secondary healers. They expend **Mana** to smite foes and protect allies.

### Class Characteristics
- **Primary Attribute:** Strength (STR) / Wisdom (WIS)
- **Resource:** Mana
- **Range:** Melee with short-range spells
- **Role:** Tank / Support Healer

## Skill List

| Rank | Skill Name       | Description                               | Skill Type        |
| ---- | ---------------- | ----------------------------------------- | ----------------- |
| 1    | Holy Strike       | Melee attack with radiant damage          | Offense (Damage)  |
| 2    | Shield of Light   | Absorbs damage for an ally                | Defense           |
| 3    | Lay on Hands      | Large single-target heal                  | Utility (Healing) |
| 4    | Righteous Charge  | Rush forward damaging and stunning foes   | Mobility/Control  |
| 5    | Consecration      | Sanctifies ground, damaging enemies       | Offense (AoE)     |
| 6    | Aura of Valor     | Increases party armor and healing taken   | Utility (Buff)    |

## Skills
### Holy Strike
- **Cooldown:** 4 s
- **Damage:** `11 + 2 * STR`
- **Mana Cost:** 20
- **Details:** Radiant-infused strike that generates additional threat.

### Shield of Light
- **Cooldown:** 15 s
- **Mana Cost:** 30
- **Duration:** 8 s
- **Details:** Grants target a shield absorbing `20 + 2 * WIS` damage.

### Lay on Hands
- **Cooldown:** 60 s
- **Healing:** `50 + 5 * WIS`
- **Mana Cost:** 60
- **Details:** Restores a large amount of health to an ally.

### Righteous Charge
- **Cooldown:** 12 s
- **Damage:** `9 + 1.5 * STR`
- **Mana Cost:** 25
- **Range:** 7 m
- **Details:** Charges forward, damaging and stunning enemies for 1 s.

### Consecration
- **Cooldown:** 18 s
- **Damage:** `6 + 1 * WIS` per second
- **Area:** 4 m radius
- **Mana Cost:** 35
- **Details:** Creates holy ground dealing damage over 6 s.

### Aura of Valor
- **Cooldown:** 25 s
- **Mana Cost:** 40
- **Duration:** 15 s
- **Details:** Increases party armor by 10% and healing received by 10%.

## Strategic Function
- Serves as off-tank with emergency healing capability.
- Provides strong defensive buffs to support group survivability.
- Uses Consecration and Righteous Charge to control enemy positioning.

## Acceptance Criteria
- Shield of Light and Aura of Valor apply buffs to correct targets.
- Lay on Hands ignores global cooldown and heals for specified amount.
- Mana costs and cooldowns enforce deliberate ability usage.
