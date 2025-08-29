# Arcane Realms — Scalable Architecture & Requirements (v1)
**Date:** August 14, 2025  
**Owner:** Arcane Realms Team

## 1) Goals & Non-Goals
**Goals**
- Top-down ARPG (Diablo/PoE/Hades/Zelda vibes) with a native LÖVE (Lua) client.
- Hybrid controls: **point-and-click + WASD**, target-lock skills, readable telegraphs.
- **Offline-capable AI** across the stack (Ollama, Whisper, Piper, optional SDXL).
- Dynamic world that **changes around the player**: procedural biomes, evolving wildlife, **breeding** (wild & player-driven), adaptive NPC dialog/quests.
- Long-term scale to **20k CCU** via realms/zones/cells/instancing.

**Non-Goals (for MVP)**
- Full asset polish, complex economy, or class variety beyond the first class.
- Fully authoritative, low-latency global netcode across continents (we’ll stage via realms).

## 2) High-Level Architecture
**Clients (LÖVE)**
- Native builds use **WebSockets** first; **WebRTC DataChannels** later (p2p voice or edge relays).
- Client prediction + server reconciliation; interest-managed replication.

**Edge Gateways**  
- Stateless WS terminators (uWebSockets.js / Nginx Unit / Envoy).  
- Auth, rate limits, route to a **zone server**.

**Authoritative Zone Servers**  
- Node.js + TypeScript initially; **Go/Rust** microservices for hot paths later.  
- Each zone simulates gameplay; target **500–2,000 players/zone** depending on density and sim cost.

**World Orchestrator**
- Assigns players to zones/instances, handles cross-zone transfers, spins/tears zones as caps are hit.
> **TODO:** Define the orchestrator's implementation language and messaging protocols.

## 3) State & Persistence
- **Postgres**: authoritative game state (accounts, inventories, economy), via Prisma.
- **Redis**: pub/sub and hot caches (spatial presence, matchmaking, rate limits).
- **Milvus**: embeddings for NPC memory, lore, player style profiles, **creature lineages** (breeding).

**Backups & Schema**
- Nightly Postgres snapshots; Milvus collection export; Redis is ephemeral.
- Migrations managed with Prisma Migrate; versioned collections for Milvus.
> **TODO:** Document backup restoration procedures and disaster-recovery playbooks.

## 4) AI Services (Offline-capable)
- **Ollama** @ `http://localhost:11434`, proxied behind a thin service with per-zone **request queues** and response caching.
- **Whisper** (faster-whisper) for STT with **Silero VAD** (optional) for push-to-talk gating.
 - **Piper** for TTS voices (per-zone instances to reduce cross-traffic).
 - **Stable Diffusion** (SDXL + ControlNet) in an **asset-gen microservice** (async) with CDN/object store caching. See [stable-diffusion.md](stable-diffusion.md) for local, open-source API options.

**Budgets**
- Per-zone LLM token/QPS caps; prompt/result cache by **(persona, memory hash, intent)**.
- Whisper chunks with short PTT windows; transcripts summarized before LLM.
- TTS: pre-warm voices; dedupe identical lines across players; short lines in combat.
- SDXL: pre-batch during low load; cache by **content hash**; stream to clients when ready.
> **TODO:** Include expected hardware specs to meet these budget assumptions.

## 5) World Slicing to Reach 20k CCU
- **Realms (macro)**: geographic clusters (e.g., NA/EU/APAC). CCU per realm depends on hardware (e.g., 2k–4k).
- **Zones (meso)**: per realm, **10–30 zone servers**, each handling **300–1,500 players**.
- **Cells (micro)**: zone partitioned into dynamic grid/quadtree of ~**50‑150-player** “interest cells”.
- **Instancing**: when a cell exceeds density thresholds or a boss event starts, spin a temporary instance (copy-on-write state) and migrate nearby players who opt-in or cross a trigger.

**Target Numbers**
- **20k CCU** = (10 realms × 2k each) **or** (5 realms × 4k each).
- Client replication budget ≈ **30–80 nearest entities** per client.

## 6) Netcode Plan (Scalable & Cheat-Resistant)
- **Authoritative** simulation on the server (ECS or modular systems).
- **Client prediction** + server reconciliation; server validates moves/skills; cooldowns & damage server-side.
- **Interest management**: grid/quadtree; replicate only relevant deltas.

**Ticks & Encodings**
- **Sim tick**: **20–30 Hz**; **net send**: **10–20 Hz** with delta compression and snapshot packing.
- Encodings: **FlatBuffers/Protobuf**, bit-packed transforms; optional **zstd** at the gateway.
- **Anti-cheat**: sanity checks on input rates, server-enforced cooldowns, server damage rolls.
> **TODO:** Clarify versioning strategy for network protocols and schema evolution.

## 7) Wildlife & Breeding at Scale
- **Background sim per cell**: ecological ticks every **5‑15s**; deterministic PRNG per cell.
- **Locality**: creatures breed/mutate within cells; lineage state handed off across cells/zones.
- **Caps & culling**: per-cell population limits; summarize distant ecology as **news events** (don’t simulate in full).
- **LLM-aided traits**: LLM synthesizes **descriptions**; stats derived from **rule-templates** to stay deterministic.

## 8) MVP → Scale Roadmap
**Phase 0 (MVP, 2–4 players)**  
- Single zone server (Node.js + WS), simple spatial grid.  
- One class, movement/combat/loot.  
- One AI NPC with voice chat (Whisper → Ollama → Piper).  
- Milvus for NPC memory & tiny bestiary.

**Phase 1 (Dozens → Hundreds)**  
- Interest management + delta snapshots.  
- Creature capture + **player breeding**; **wild breeding** background ticks.  
- SD asset-gen queue for icons/portraits.  
- **Multi-zone** with sticky routing at gateways.

**Phase 2 (Thousands)**  
- Dedicated **orchestrator**; **dynamic instancing**; cross-zone transfers.  
- Boss events with **load-shedding** (split instances).  
- Per-zone **AI quotas**; **Milvus sharding** (by zone/realm).

**Phase 3 (20k CCU)**  
- Multi-realm deployment; autoscale zones.  
- WebRTC datachannels where stable; uWS fallback.  
- Service mesh (Linkerd or similar) or lightweight gRPC.  
- CDN/object store for generated assets; cache invalidation on new versions.

## 9) Practical Tech Picks
- **Server language**: Node.js + TS to start; move hot CPU paths (physics, AoE) to Rust/Go services if needed.
- **Networking**: uWebSockets.js (WS); optional Colyseus-style “rooms” for prototypes.
- **ECS**: **bitecs** (JS) or lightweight custom ECS per cell.
- **Persistence**: Postgres + Prisma; Redis; Milvus.
- **Observability**: Prometheus + Grafana (per-zone tick time, GC time, send queue depth, AI QPS).

## 10) Security, Abuse, & Reliability
- **Auth** at gateway; per-IP and per-user **rate limits**; per-zone AI quotas.
- **Input validation** on server; cooldown & resource checks server-side.
- **Back-pressure**: drop cosmetic updates first; preserve authoritative state deltas.
- **DoS** hardening at gateway (connection caps, SYN cookies if applicable, zstd cutoff).

## 11) Offline-First & Local Dev
- **Ollama** `http://localhost:11434`, **Whisper**, **Piper**, **Milvus** via docker-compose.  
- Server exposes `/llm`, `/stt`, `/tts`, `/memory` endpoints; client uses those, never calls tools directly.

**Local Ports (suggested)**  
- Client (Vite): `5173`  
- Game WS: `8080`  
- AI proxy (HTTP): `8081`  
- Milvus: `19530`  
- Postgres: `5432`  
- Redis: `6379`

## 12) Open TODOs / Next Steps
- [ ] **Integrate into `DESIGN.md`** → Create `20k-Scalability.md` in `/docs` with above architecture.
- [ ] **Repo cleanup** → purge `node_modules`, builds, logs, `.env` from history.
- [ ] **Label/Board setup** → add epics for each Phase in GitHub Projects.
- [ ] **Prototype orchestration logic** (simplified for MVP).
- [ ] **Milvus + Ollama docker-compose** for local AI stack.
- [ ] **Interest management stub** in TestScene to prep for multi-zone.
- [ ] **AI service quotas** → config + stub caching layer.

## 13) Glossary
- **Realm**: geographic cluster.  
- **Zone**: authoritative game server instance.  
- **Cell**: interest-management partition within a zone.  
- **Instance**: temporary copy of zone subset for events/bosses.

## 14) Ownership & Versioning
- This document is versioned in `docs/20k-Scalability.md`.  
- Changes via PRs tagged `area:architecture`.

## 15) Risks & Mitigations
- **AI budget blowups** → enforce hard quotas per zone; cache aggressively.  
- **Zone hotspots** → instancing/splitting; event load-shedding.  
- **Client perf** → cull/LOD on effects; reduce replication frequency; pool objects.

## 16) Implementation Checklist (First Pass)
- [ ] **Commit this document**.  
- [ ] Add `docs/SETUP.md` + docker compose for AI stack.  
- [ ] Implement `/llm` proxy + minimal cache.  
- [ ] Add interest grid + basic replication filters.
