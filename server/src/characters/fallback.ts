import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type CharacterParams = Record<string, string | undefined>;

export interface CharacterPreset {
  id: string;
  name?: string;
  portraitUrl?: string;
  params: CharacterParams;
  [key: string]: any;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PRESET_DIR = path.resolve(__dirname, '../../../assets/characters/presets');

export class FallbackManager {
  private presets: CharacterPreset[] = [];

  constructor(private presetDir: string = DEFAULT_PRESET_DIR) {
    this.loadPresets();
  }

  loadPresets(): void {
    try {
      const files = fs.readdirSync(this.presetDir).filter(f => f.endsWith('.json'));
      this.presets = files.map(file => {
        const raw = fs.readFileSync(path.join(this.presetDir, file), 'utf-8');
        return JSON.parse(raw) as CharacterPreset;
      });
    } catch {
      this.presets = [];
    }
  }

  findClosest(params: CharacterParams): CharacterPreset | null {
    let best: CharacterPreset | null = null;
    let bestScore = -1;
    for (const preset of this.presets) {
      let score = 0;
      for (const key of Object.keys(params)) {
        if (params[key] !== undefined && preset.params?.[key] === params[key]) {
          score += 1;
        }
      }
      if (score > bestScore) {
        best = preset;
        bestScore = score;
      }
    }
    return best;
  }

  private customize(preset: CharacterPreset, params: CharacterParams): CharacterPreset {
    return {
      ...preset,
      params: {
        ...preset.params,
        ...params
      }
    };
  }

  get(params: CharacterParams): CharacterPreset {
    const match = this.findClosest(params);
    if (match) {
      return this.customize(match, params);
    }
    return { id: 'fallback', params };
  }
}

export const fallbackManager = new FallbackManager();
export default FallbackManager;
