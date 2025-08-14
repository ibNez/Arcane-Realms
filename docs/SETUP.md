# Setup Guide

This document explains how to set up the Arcane Realms project for local development and testing.

## Prerequisites

- **Node.js v20.x** (LTS) and npm or yarn  
- **Git** for version control  
- **Docker** and **docker‑compose** for the offline AI stack  
- A working **GPU** is recommended if you plan to run larger models like SDXL

Clone the repository:

```
git clone https://github.com/ibNez/Arcane-Realms.git
cd Arcane-Realms
```

## Install Dependencies

Install dependencies in the client and server directories:

```
cd client && npm install
cd ../server && npm install
```

These commands install the TypeScript build system, Phaser, ws and other runtime dependencies.

## Running the Offline AI Stack

Arcane Realms is designed to work offline with locally hosted models. Use the provided docker compose file to spin up Milvus, Postgres, Redis and Ollama. This does **not** include Whisper or Piper yet; see below.

```
# From the project root
docker compose -f ops/docker-compose.yml up -d
```

This starts the following services (ports exposed on your machine):

- **Ollama** on `http://localhost:11434` – hosts the LLM models
- **Postgres** on `localhost:5432` – game state
- **Redis** on `localhost:6379` – pub/sub and caches
- **Milvus** on `localhost:19530` – vector memory (NPC memory, creature lineages)

Stable Diffusion is not part of `docker-compose`. Run it separately if you plan to generate or edit images. See [stable-diffusion.md](stable-diffusion.md) for Windows installation and API options.

You should pull any required models into the Ollama container before first use. From your host:

```
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

For other models (Mistral, Gemma, etc.), change the model name accordingly. You can mount additional volumes in the `ops/docker-compose.yml` file to persist Ollama models across restarts.

### Whisper and Piper

Whisper (speech‑to‑text) and Piper (text‑to‑speech) run outside `docker-compose` and must be installed manually. After starting the servers, point the game server at them via `server/.env`.

#### faster‑whisper

```sh
python3 -m venv whisper-venv
source whisper-venv/bin/activate
pip install faster-whisper fastapi uvicorn
cat <<'EOF' > whisper_server.py
from fastapi import FastAPI, UploadFile
from faster_whisper import WhisperModel

app = FastAPI()
model = WhisperModel("base")

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    segments, _ = model.transcribe(await file.read())
    return {"text": " ".join(seg.text for seg in segments)}
EOF
uvicorn whisper_server:app --host 0.0.0.0 --port 9001
```

Example systemd service (`/etc/systemd/system/faster-whisper.service`):

```ini
[Unit]
Description=Faster Whisper API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/whisper
ExecStart=/opt/whisper/whisper-venv/bin/uvicorn whisper_server:app --host 0.0.0.0 --port 9001
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### Piper

```sh
python3 -m pip install "piper-tts[http]"
python3 -m piper.download_voices en_US-lessac-medium
python3 -m piper.http_server -m en_US-lessac-medium --host 0.0.0.0 --port 9002
```

Example systemd service (`/etc/systemd/system/piper.service`):

```ini
[Unit]
Description=Piper TTS HTTP Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/piper
ExecStart=/usr/bin/python3 -m piper.http_server -m en_US-lessac-medium --host 0.0.0.0 --port 9002
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Set the following variables in `server/.env` to let the game know where these services live:

```env
WHISPER_URL=http://localhost:9001
PIPER_URL=http://localhost:9002
```

## Running the Game Locally

To start the game in development mode:

```
# start the server (express + ws)
cd server
npm run dev

# in a separate terminal, start the client
cd client
npm run dev
```

- The **client** runs via Vite on `http://localhost:5173`.
- The **server** exposes a WebSocket on `ws://localhost:8080` for multiplayer and routes on `http://localhost:8080`.

Open `http://localhost:5173` in a browser to play. The Test Area is available at root.

## Environment Variables

The server reads configuration from `.env`. Use the provided `.env.example` as a starting point:

```
cp server/.env.example server/.env
# then edit server/.env to change ports or DB credentials
```

**Important** – never commit your `.env` files or other secrets to the repository. The `.gitignore` includes patterns to ignore `.env`.

## Additional Tips

- Use **GitHub Codespaces** or another remote dev environment if you don’t want to run Docker locally.  
- When working with large models, allocate enough memory to Docker; some models require several GB of RAM/VRAM.  
- To tear down the AI stack:

```
docker compose -f ops/docker-compose.yml down
```

The database and vector data are persisted in the `ops/` volumes configured in `docker-compose.yml`.

For more information about the architecture, see `docs/20k-Scalability.md`.

## Troubleshooting

- **GPU not detected** – confirm `nvidia-smi` works and that your CUDA toolkit matches the driver version. Both faster‑whisper and Piper can fall back to CPU with the appropriate flags.
- **CPU models too slow** – use smaller models (e.g., `base` for Whisper or `en_US-lessac-medium` for Piper) or enable GPU acceleration.
- **Illegal instruction errors** – some binaries require AVX2; compile from source if running on older CPUs.
