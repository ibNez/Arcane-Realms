# Stable Diffusion Integration

Arcane Realms relies on open-source Stable Diffusion services for text-to-image, image-to-image, and inpainting tasks (e.g., redrawing walls, trees, bushes, or houses) on Windows 11 hardware with an RTX 5090 GPU.

## Available Options

| Service | License | Highlights |
| --- | --- | --- |
| [Automatic1111 WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) | MIT | One-click Windows launcher (`webui-user.bat`), simple REST API via `--api`, supports inpainting and ControlNet. |
| [ComfyUI](https://github.com/comfyanonymous/ComfyUI) | GPL‑3.0 | Node/graph-based workflows, REST API with `--listen`, ideal for complex pipelines. |
| [InvokeAI](https://github.com/invoke-ai/InvokeAI) | Apache‑2.0 | Web interface plus REST endpoints, focused on image editing. |
| [Diffusers + FastAPI](https://github.com/huggingface/diffusers) | Apache‑2.0 | Build a custom service using Hugging Face Diffusers and FastAPI for maximum control. |

All of these options run locally and satisfy the requirement to use public, free software.

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

