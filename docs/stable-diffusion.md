# Stable Diffusion Integration

Arcane Realms relies on open-source Stable Diffusion services for text-to-image, image-to-image, and inpainting tasks (e.g., redrawing walls, trees, bushes, or houses) on Windows 11 hardware with an RTX 5090 GPU.

## Linux and macOS Setup

### Linux (Ubuntu 22.04 example)

1. Install up‑to‑date GPU drivers.
   - **NVIDIA**: `sudo apt install nvidia-driver-535` then verify with `nvidia-smi`.
   - **AMD**: install ROCm 5+ following [AMD’s instructions](https://rocm.docs.amd.com/en/latest/).
2. Install Python 3.10 and Git: `sudo apt install python3 python3-venv git`.
3. Clone and launch a Stable Diffusion service (Automatic1111 shown):
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   cd stable-diffusion-webui
   ./webui.sh --xformers --api
   ```

### macOS (Apple Silicon)

1. Ensure macOS 13+ with Xcode command line tools: `xcode-select --install`.
2. Install Homebrew, Python 3.10, and Git: `brew install python@3.10 git`.
3. Install PyTorch with Metal (GPU) acceleration:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/metal
   ```
4. Clone and launch the service:
   ```bash
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   cd stable-diffusion-webui
   ./webui.sh --api
   ```

## Available Options

| Service | License | Highlights |
| --- | --- | --- |
| [Automatic1111 WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) | MIT | One-click Windows launcher (`webui-user.bat`), simple REST API via `--api`, supports inpainting and ControlNet. |
| [ComfyUI](https://github.com/comfyanonymous/ComfyUI) | GPL‑3.0 | Node/graph-based workflows, REST API with `--listen`, ideal for complex pipelines. |
| [InvokeAI](https://github.com/invoke-ai/InvokeAI) | Apache‑2.0 | Web interface plus REST endpoints, focused on image editing. |
| [Diffusers + FastAPI](https://github.com/huggingface/diffusers) | Apache‑2.0 | Build a custom service using Hugging Face Diffusers and FastAPI for maximum control. |

All of these options run locally and satisfy the requirement to use public, free software.

### Choosing a Service

- **Automatic1111 WebUI** – quick to launch and backed by a huge extension ecosystem. Ideal for individual artists or rapid prototyping with a familiar browser UI. *Cons:* heavier on resources and not optimized for headless scaling.
- **ComfyUI** – node-based graph editor excels at building complex, repeatable pipelines. Great when you need ControlNet chains or multi-step workflows. *Cons:* steeper learning curve and more cumbersome to automate.
- **InvokeAI** – polished installer with streamlined Web and CLI interfaces focused on image editing. Efficient memory usage. *Cons:* smaller community and a less extensive plugin system.
- **Diffusers + FastAPI** – build exactly what you need with Hugging Face Diffusers in a minimal FastAPI service. Ideal for production backends where you want tight control over models, security, and scaling. *Cons:* requires Python development effort to implement features provided out of the box by other tools.

For quick experiments, Automatic1111 or InvokeAI offer the fastest path. ComfyUI shines for custom pipelines, while a bespoke Diffusers service is best for long‑term, production deployments.

## Quick Start (Automatic1111 Example)

1. Install **Python 3.10** and **Git** on Windows.
2. Clone and launch:
   ```cmd
   git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
   cd stable-diffusion-webui
   webui-user.bat --xformers --api
   ```
3. Place model checkpoints (e.g., `v1-5-pruned.safetensors`, `sd_xl_base_1.0.safetensors`) in `models/Stable-diffusion/`.
4. Access the REST API:
   - `POST /sdapi/v1/txt2img`
   - `POST /sdapi/v1/img2img` (supports masks for inpainting)

## GPU & Performance Notes

- Install the latest NVIDIA drivers and CUDA toolkit for the RTX 5090.
- Enable `xformers` or FlashAttention to reduce VRAM usage.
- SDXL models require roughly 12 GB of VRAM, which fits comfortably on the 5090.
> **TODO:** Include benchmarks or expected generation times under typical configurations.

## Tiling Strategy & Scale

Stable Diffusion commonly outputs images at **1024 × 1024**. Arcane Realms treats
each output as a ground **tile** and maps it to gameplay space:

- **Pixel scale**: 1 grid cell = 16 px
- **World scale**: 1 grid cell = 5 ft
- **Tile span**: 1024 px ÷ 16 px = 64 cells → 64 × 5 ft = **320 ft per side**

To exceed the single-tile limit:

- **2 × 2 tiles** (4 tiles total) → 2048 × 2048 scene covering ~640 ft per side
- **4 × 4 tiles** (16 tiles total) → 4096 × 4096 scene covering ~1280 ft per side

Tiles must be generated with seamless borders so ground textures repeat cleanly
in any arrangement. Characters drawn at **32–48 px** tall will appear roughly
human‑sized (5–7 ft) on this scale.

