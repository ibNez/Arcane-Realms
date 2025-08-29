# Development Roadmap

This document outlines a phased plan for building Arcane Realms from a minimum viable product (MVP) to a full multi‑realm deployment supporting tens of thousands of players. Each phase includes key deliverables and example tasks.

> **Timeline & Dependencies:** Assuming a small team of 2–3 contributors, Phase 0 aims for a **Q4 2024** target. Each subsequent phase builds on the stability of the previous one—Phase 1 begins once the MVP is playable, Phase 2 after multi‑zone support is proven, and Phase 3 when thousands of concurrent players can be handled reliably. Dates are aspirational and should be revisited after major milestones.

## Phase 0 – MVP (2–4 players)

- [ ] Single authoritative **zone server** with basic WebSocket multiplayer.
- [ ] Implement one **Mage class** with three skills: Magic Missile, Arcane Nova and Heal. ([spec](mage-skills.md))
- [ ] Create a **Test Area** scene with spawn/reset controls, Dev Console (`~`) and skill bar.
- [ ] Enemy **FSM** (Idle → Pursue → Wind‑up → Attack → Recover) and simple melee telegraph. ([spec](enemy-fsm.md))
- [ ] Player **HP**, **death & respawn** flow, invulnerability frames.
- [ ] In‑game **chat NPC** using Ollama via `/llm`.
- [ ] **AI-powered character creation** with Stable Diffusion generated portraits and randomization options.
- [ ] Set up **Milvus** with a tiny bestiary and NPC memory collection.
- [ ] Local AI stack via `ops/docker-compose.yml` (Ollama, Postgres, Redis, Milvus).

**Success metrics**

- 4 players can connect and remain in sync for **30 min** without server restart.
- Average command latency under **100 ms** on a LAN.
- Character generation (portrait + stats) completes in **<10 s**.

## Phase 1 – Dozens to Hundreds of Players

- [ ] Implement **interest management** using a grid/quadtree; send only nearby entity updates.
- [ ] Add **delta snapshots** to reduce bandwidth.
- [ ] **Creature capture** and basic **player breeding** (UI for combining two creatures and viewing offspring).
- [ ] Background **wild breeding** ticks (5–15 s) with population caps per cell.
- [ ] Add an **asset generation queue** for icons/portraits via SDXL; cache by content hash.
- [ ] Implement **dynamic environment system** with base asset library and biome-specific Stable Diffusion transformations (see [asset-catalog.md](asset-catalog.md)).
- [ ] Support **multi‑zone** deployment; route players to a zone; persist state per zone.
- [ ] Sticky routing at the gateway to keep players on the same zone while exploring.

**Load-testing target**

- Sustain **200 concurrent players** per zone with server tick under **50 ms** and <5 % packet loss.

## Phase 2 – Thousands of Players

- [ ] Build an **orchestrator/matchmaker** to assign players to zones and spin up/down zones.
- [ ] **Dynamic instancing** for high‑density events (e.g., boss fights, dungeons).
- [ ] **Cross‑zone transfer** of players and their creatures/inventory.
- [ ] Introduce **combat events** and **bosses** with load‑shedding (split instance if threshold).
- [ ] Implement **per‑zone AI quotas**; shard Milvus collections by zone or realm.
- [ ] Optimise server code; offload CPU‑intensive tasks (physics, AoE checks) to Rust/Go microservices.

**Profiling & benchmarks**

- Use `node --prof`, [`0x`](https://github.com/davidmarkclements/0x), and flamegraphs during load tests.
- Target **1000 players** per zone while keeping CPU utilisation below **80 %** on reference hardware.

## Phase 3 – 20 000 Concurrency Target

- [ ] Roll out **multi‑realm deployment** (e.g., NA, EU, APAC).
- [ ] Support **auto‑scaling** of zone servers based on load.
- [ ] Evaluate **WebRTC data channels** for low‑latency segments; fall back to uWS WebSockets where unstable.
- [ ] Introduce a **service mesh** (Linkerd, gRPC) for inter‑service comms.
- [ ] Use a **CDN/object store** for generated assets (portraits, creature images); implement cache invalidation.
- [ ] Integrate **additional classes** (Warrior, Ranger, Summoner) and cooperative features (dungeons, raids).
- [ ] Enhance the **breeding ecosystem** with genes for temperament, diet, and new species.

**Release criteria**

- 99.5 % uptime across all realms with automatic failover.
- Cross‑region latency under **200 ms** for 95 % of players.
- Monitoring via Prometheus/Grafana with paging on SLA breaches.

## Ongoing Tasks

- [ ] Maintain **code quality**: linting, testing, type safety.
- [ ] Monitor performance with **Prometheus/Grafana**; tune tick rates, heap, and network usage.
- [ ] Harden security: input validation, rate limiting, anti‑cheat measures.
- [ ] Continually refine **user experience**: controls, feedback, art direction, accessibility.
- [ ] Gather **player feedback** through playtests and adjust roadmap accordingly.
- [ ] Keep `docs/API.md` updated with supported embedding models, audio parameters, image resolutions and TTS voices.

> **Roadmap updates:** Review progress at the end of each monthly milestone. Incorporate player feedback and technical discoveries into the next revision; significant scope changes require team consensus.
